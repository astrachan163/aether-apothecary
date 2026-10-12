/**
 * Portfolio Bot runs this AFTER Cody's PASS. It is not run in this PR.
 * Usage: ALLOW_ADMIN_CLAIM_WRITE=1 node scripts/grant-admin-claim.mjs
 * Requires GOOGLE_APPLICATION_CREDENTIALS for aether-apothecary.
 * Writes admin: true on the existing strachan@uab.edu user. It does not create users.
 */

if (process.env.ALLOW_ADMIN_CLAIM_WRITE !== '1') {
  console.error('Refusing to change Auth claims. Set ALLOW_ADMIN_CLAIM_WRITE=1 when Portfolio Bot runs this after review.');
  process.exit(1);
}

const admin = await import('firebase-admin');
admin.initializeApp({ projectId: 'aether-apothecary' });
const email = 'strachan@uab.edu';
const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
console.log(`Set admin claim for uid ${user.uid}`);
