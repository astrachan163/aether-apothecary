const KINDS = new Set(['products', 'ingredients', 'stories', 'faqs']);
const USES = new Set(['spiritual', 'emotional', 'physical', 'mental']);
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

function fail(message) {
  const error = new Error(message);
  error.name = 'invalid-argument';
  return error;
}

function requiredString(value, max) {
  if (typeof value !== 'string' || value.length < 1 || value.length > max) throw fail('string');
  return value;
}

function optionalString(value, max) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > max) throw fail('string');
  return value;
}

function stringList(value, maxItems, maxLen, allowed) {
  if (!Array.isArray(value) || value.length > maxItems) throw fail('list');
  return value.map((item) => {
    if (typeof item !== 'string' || item.length < 1 || item.length > maxLen) throw fail('list');
    if (allowed && !allowed.has(item)) throw fail('list');
    return item;
  });
}

function price(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10000) throw fail('price');
  return Math.round(value * 100) / 100;
}

function whole(value, max) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > max) throw fail('number');
  return value;
}

function flag(value) {
  if (typeof value !== 'boolean') throw fail('bool');
  return value;
}

function imageUrl(value) {
  const text = requiredString(value, 300);
  if (!text.startsWith('/images/') && !text.startsWith('https://firebasestorage.googleapis.com/')) throw fail('image');
  return text;
}

const SHAPES = {
  products(data, id) {
    return {
      id,
      name: requiredString(data.name, 120),
      shortDescription: requiredString(data.shortDescription, 180),
      description: requiredString(data.description, 2000),
      imageUrl: imageUrl(data.imageUrl),
      price: price(data.price),
      category: requiredString(data.category, 40),
      uses: stringList(data.uses, 4, 20, USES),
      ingredients: stringList(data.ingredients, 16, 80),
      sku: optionalString(data.sku, 40) ?? '',
      inventory: whole(data.inventory, 100000),
      active: flag(data.active),
      published: flag(data.published),
    };
  },
  ingredients(data, id) {
    return {
      id,
      slug: requiredString(data.slug, 80),
      name: requiredString(data.name, 120),
      description: requiredString(data.description, 2000),
      traditionalUses: requiredString(data.traditionalUses, 2000),
      spiritualBenefits: requiredString(data.spiritualBenefits, 2000),
      physicalBenefits: requiredString(data.physicalBenefits, 2000),
      imageUrl: imageUrl(data.imageUrl),
      published: flag(data.published),
    };
  },
  stories(data, id) {
    return {
      id,
      userName: requiredString(data.userName, 80),
      story: requiredString(data.story, 2000),
      productId: optionalString(data.productId, 64) ?? '',
      productName: optionalString(data.productName, 120) ?? '',
      date: requiredString(data.date, 40),
      sample: flag(data.sample),
      published: flag(data.published),
    };
  },
  faqs(data, id) {
    return {
      id,
      question: requiredString(data.question, 200),
      answer: requiredString(data.answer, 2000),
      published: flag(data.published),
    };
  },
};

function validateCatalogItem(kind, id, data) {
  if (!KINDS.has(kind)) throw fail('kind');
  if (typeof id !== 'string' || !ID_RE.test(id)) throw fail('id');
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw fail('item');
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) throw fail('nesting');
    if (Array.isArray(value) && value.some((item) => item && typeof item === 'object')) throw fail('nesting');
  }
  return SHAPES[kind](data, id);
}

function assertCheckoutItem(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw fail('item');
  if (typeof item.id !== 'string' || !ID_RE.test(item.id)) throw fail('id');
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 10) throw fail('quantity');
  return { id: item.id, qty: item.qty };
}

function assertAllowlistedPrice(priceId, allowlist) {
  if (typeof priceId !== 'string' || !priceId.startsWith('price_') || !allowlist.has(priceId)) throw fail('price');
  return priceId;
}

module.exports = {
  KINDS,
  validateCatalogItem,
  assertCheckoutItem,
  assertAllowlistedPrice,
};
