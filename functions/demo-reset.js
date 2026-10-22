const HERBAL_APP = 'herbal';
const HERBAL_DEMO_UID = /^demo_store-admin_[a-f0-9]{16}$/;

function isOwnedHerbalSandbox(uid, root, counter) {
  return HERBAL_DEMO_UID.test(uid) && root?.app === HERBAL_APP
    && counter?.app === HERBAL_APP && Number.isInteger(counter.count)
    && counter.count >= 0 && counter.count <= 200;
}

async function resetHerbalSandboxes(db) {
  const roots = await db.collection('sandboxes').where('app', '==', HERBAL_APP).get();
  let reset = 0;
  for (const root of roots.docs) {
    if (!HERBAL_DEMO_UID.test(root.id)) continue;
    const counter = await db.doc(`sandboxes/${root.id}/counters/docs`).get();
    if (!isOwnedHerbalSandbox(root.id, root.data(), counter.data())) continue;
    await db.recursiveDelete(root.ref);
    reset += 1;
  }
  // Rate counters, Auth accounts and unmarked/foreign records are retained.
  return { reset };
}

module.exports = { HERBAL_APP, isOwnedHerbalSandbox, resetHerbalSandboxes };
