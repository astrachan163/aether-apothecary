const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const { createHash, randomBytes } = require('node:crypto');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const { validateCatalogItem, assertCheckoutItem, assertAllowlistedPrice } = require('./catalog-item');
const { commitSandboxItem } = require('./sandbox-write');

setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const stripeSecret = defineSecret('STRIPE_SECRET_KEY_TEST');
const webhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET_TEST');
const geminiSecret = defineSecret('GEMINI_API_KEY');

const PRICE_ALLOWLIST = new Set(JSON.parse(readFileSync(join(__dirname, 'stripe-price-allowlist.json'), 'utf8')));
const APP_CHECK = { enforceAppCheck: true, consumeAppCheckToken: true };
const ADMIN_EMAIL = 'strachan@uab.edu';
const MODEL_OWNER = 'gemini-3.8-flash';
const MODEL_HEAVY = 'gemini-3.1-pro-preview';

function app() {
  if (!admin.apps.length) admin.initializeApp();
  return admin.app();
}

function db() {
  return app().firestore();
}

function isAdmin(token) {
  return Boolean(token && token.admin === true && token.email === ADMIN_EMAIL && token.email_verified === true);
}

function isDemo(token) {
  return Boolean(token && token.demo === true && typeof token.role === 'string');
}

function assertSecretTestKey(key) {
  if (!key || !key.startsWith('sk_test_') || key.includes('sk_live_')) {
    throw new HttpsError('failed-precondition', 'Stripe test key is missing.');
  }
}

function loadSeed() {
  const dir = join(__dirname, 'seed');
  const files = readdirSync(dir).filter((name) => name.endsWith('.json'));
  const seed = {};
  for (const file of files) {
    seed[file.replace(/\.json$/, '')] = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  }
  return seed;
}

function bannedHit(text) {
  const disclaimer = 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.';
  const scrubbed = String(text).split(disclaimer).join(' ');
  const words = ['blood pressure', 'treat', 'cure', 'prevent', 'heal', 'anxiety', 'depression', 'cancer', 'diabetes', 'inflammation', 'immune', 'pain', 'insomnia', 'detox', 'arthritis', 'covid', 'disease', 'ailment', 'remedy'];
  for (const word of words) {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    if (pattern.test(scrubbed)) return word;
  }
  return null;
}

function assertCatalogFields(data) {
  for (const value of Object.values(data || {})) {
    if (typeof value !== 'string') continue;
    const hit = bannedHit(value);
    if (hit) throw new HttpsError('invalid-argument', `blocked-claim:${hit}`);
  }
}

async function copySeedToSandbox(uid) {
  const seed = loadSeed();
  const batch = db().batch();
  const slots = [];
  let count = 0;
  for (const [kind, docs] of Object.entries(seed)) {
    if (!Array.isArray(docs) || kind === 'orders') continue;
    for (const doc of docs) {
      if (!doc.id || count >= 200) continue;
      const ref = db().doc(`sandboxes/${uid}/catalog/${kind}/items/${doc.id}`);
      batch.set(ref, { ...doc, published: doc.published !== false });
      slots.push(`${kind}/${doc.id}`);
      count += 1;
    }
  }
  const orders = Array.isArray(seed.orders) ? seed.orders : [];
  for (const order of orders) {
    batch.set(db().doc(`sandboxes/${uid}/orders/${order.id}`), order);
  }
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
  batch.set(db().doc(`sandboxes/${uid}`), { aiCalls: 0, expiresAt });
  batch.set(db().doc(`sandboxes/${uid}/counters/docs`), { ids: slots });
  await batch.commit();
}

exports.startDemoSession = onCall({ enforceAppCheck: true, consumeAppCheckToken: true }, async (request) => {
  const role = request.data?.role;
  if (role !== 'store-admin') {
    throw new HttpsError('invalid-argument', 'Unknown role.');
  }
  const appId = request.app?.appId || 'unknown-app';
  const ip = request.rawRequest?.ip || 'unknown-ip';
  const clientHash = createHash('sha256').update(`${appId}|${ip}|vhe-demo`).digest('hex');
  const counterRef = db().doc('demo_meta/counters');
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  await db().runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const data = snap.exists ? snap.data() : { day, dayCount: 0, clients: {} };
    const dayCount = data.day === day ? data.dayCount : 0;
    if (dayCount >= 300) throw new HttpsError('resource-exhausted', 'Demo cap reached.');
    const client = data.clients?.[clientHash];
    const hourCount = client && client.hour === hour ? client.count : 0;
    if (hourCount >= 5) throw new HttpsError('resource-exhausted', 'Demo cap reached.');
    tx.set(counterRef, {
      day,
      dayCount: dayCount + 1,
      clients: { ...(data.clients || {}), [clientHash]: { hour, count: hourCount + 1 } },
    });
  });
  const uid = `demo_${role}_${randomBytes(8).toString('hex')}`;
  await app().auth().createUser({ uid });
  await copySeedToSandbox(uid);
  const token = await app().auth().createCustomToken(uid, { demo: true, role });
  return { token };
});

exports.resetDemo = onSchedule({ schedule: '0 3 * * *', timeZone: 'America/Chicago' }, async () => {
  const sandboxes = await db().collection('sandboxes').listDocuments();
  for (const doc of sandboxes) {
    const uid = doc.id;
    if (!uid.startsWith('demo_')) continue;
    await app().firestore().recursiveDelete(doc);
  }
  let pageToken;
  do {
    const listed = await app().auth().listUsers(1000, pageToken);
    for (const user of listed.users) {
      if (!user.uid.startsWith('demo_')) continue;
      await app().auth().deleteUser(user.uid);
    }
    pageToken = listed.pageToken;
  } while (pageToken);
  await db().doc('demo_meta/counters').set({ day: '', dayCount: 0, clients: {} });
  const seed = loadSeed();
  for (const [kind, docs] of Object.entries(seed)) {
    if (!Array.isArray(docs)) continue;
    for (const doc of docs) {
      if (!doc.id) continue;
      await db().doc(`demo_seed/${kind}/items/${doc.id}`).set(doc);
    }
  }
});

exports.saveCatalogItem = onCall(APP_CHECK, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const token = request.auth.token || {};
  const kind = request.data?.kind;
  const id = request.data?.id;
  const data = request.data?.data;
  let sanitized;
  try {
    sanitized = validateCatalogItem(kind, id, data);
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message || 'Invalid catalog item.');
  }
  assertCatalogFields(sanitized);
  if (isDemo(token)) {
    if (!request.auth.uid.startsWith('demo_')) throw new HttpsError('permission-denied', 'Demo only.');
    const header = request.rawRequest?.headers?.authorization || '';
    const userToken = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
    const status = await commitSandboxItem({
      token: userToken,
      projectId: process.env.GCLOUD_PROJECT || 'aether-apothecary',
      uid: request.auth.uid,
      kind,
      id,
      data: sanitized,
      fetchImpl: fetch,
    });
    if (status !== 200) throw new HttpsError('permission-denied', 'Rules rejected the sandbox write.');
    return { ok: true, root: 'sandbox' };
  }
  if (!isAdmin(token)) throw new HttpsError('permission-denied', 'Admin only.');
  await db().doc(`catalog/${kind}/items/${id}`).set(sanitized);
  return { ok: true, root: 'catalog' };
});

exports.createCheckoutSession = onCall({ ...APP_CHECK, secrets: [stripeSecret] }, async (request) => {
  if (isDemo(request.auth?.token)) {
    throw new HttpsError('permission-denied', 'Demo checkout is off.');
  }
  const key = stripeSecret.value();
  try {
    assertSecretTestKey(key);
  } catch {
    throw new HttpsError('failed-precondition', 'Checkout is off today: no orders, no charges, and no card details are collected.');
  }
  const items = Array.isArray(request.data?.items) ? request.data.items : [];
  if (items.length === 0) throw new HttpsError('invalid-argument', 'Cart is empty.');
  const lineItems = [];
  for (const raw of items) {
    let item;
    try {
      item = assertCheckoutItem(raw);
    } catch {
      throw new HttpsError('invalid-argument', 'Bad item id or quantity.');
    }
    const snap = await db().doc(`catalog/products/items/${item.id}`).get();
    if (!snap.exists || snap.data().published !== true) {
      throw new HttpsError('not-found', 'That product is not for sale.');
    }
    let priceId;
    try {
      priceId = assertAllowlistedPrice(snap.data().stripePriceId, PRICE_ALLOWLIST);
    } catch {
      throw new HttpsError('failed-precondition', 'That product has no allowlisted Stripe test price.');
    }
    lineItems.push({ quantity: item.qty, price: priceId });
  }
  const stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: 'https://herbal.nonartificialsi.com/cart?status=success',
    cancel_url: 'https://herbal.nonartificialsi.com/cart?status=cancel',
  });
  return { url: session.url };
});

exports.stripeWebhook = onRequest({ secrets: [webhookSecret, stripeSecret] }, async (req, res) => {
  const secret = webhookSecret.value();
  const key = stripeSecret.value();
  const signature = req.get('stripe-signature');
  if (!secret || !signature || !key || !key.startsWith('sk_test_') || key.includes('sk_live_')) {
    res.status(400).send('Bad signature');
    return;
  }
  try {
    const stripe = new Stripe(key, { apiVersion: '2024-06-20' });
    const event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await db().collection('orders').doc(event.id).set({
        stripeSessionId: session.id || '',
        email: session.customer_details?.email || session.customer_email || '',
        name: session.customer_details?.name || '',
        amountTotal: session.amount_total || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    res.status(200).send('ok');
  } catch {
    res.status(400).send('Bad signature');
  }
});

exports.aiGenerate = onCall({ secrets: [geminiSecret] }, async (request) => {
  if (!request.auth || isDemo(request.auth.token) || !isAdmin(request.auth.token)) {
    throw new HttpsError('permission-denied', 'Admin only.');
  }
  const apiKey = geminiSecret.value();
  if (!apiKey) throw new HttpsError('failed-precondition', 'AI is not connected.');
  const heavy = request.data?.heavy === true;
  const model = heavy ? MODEL_HEAVY : MODEL_OWNER;
  const prompt = String(request.data?.prompt || '').slice(0, 4000);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2048 },
    }),
  });
  if (!response.ok) throw new HttpsError('internal', 'The model did not answer.');
  const parsed = await response.json();
  const text = parsed.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  const hit = bannedHit(text);
  if (hit) throw new HttpsError('invalid-argument', `blocked-claim:${hit}`);
  const day = new Date().toISOString().slice(0, 10);
  await db().doc(`ai_usage/${day}`).set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });
  return { text, model, tier: 'owner' };
});

exports.aiModels = onCall({ secrets: [geminiSecret] }, async (request) => {
  if (!request.auth || isDemo(request.auth.token) || !isAdmin(request.auth.token)) {
    throw new HttpsError('permission-denied', 'Admin only.');
  }
  const apiKey = geminiSecret.value();
  if (!apiKey) throw new HttpsError('failed-precondition', 'AI is not connected.');
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', {
    headers: { 'x-goog-api-key': apiKey },
  });
  if (!response.ok) throw new HttpsError('internal', 'Model list failed.');
  const parsed = await response.json();
  const models = (parsed.models || [])
    .map((model) => ({
      id: String(model.name || '').replace(/^models\//, ''),
      methods: model.supportedGenerationMethods || [],
    }))
    .filter((model) => model.methods.includes('generateContent') && /^gemini-\d/.test(model.id))
    .filter((model) => !/(tts|live|image|embedding|imagen-|veo-)/.test(model.id));
  return { models };
});
