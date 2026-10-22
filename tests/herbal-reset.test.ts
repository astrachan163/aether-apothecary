import { describe, expect, it } from 'vitest';
import { loadFunctions } from './helpers/load-functions';

function fixture(rateApp?: string) {
  const owned = 'demo_store-admin_0123456789abcdef';
  const unmarked = 'demo_store-admin_1111111111111111';
  const foreign = 'demo_tutor_2222222222222222';
  const counterForeign = 'demo_store-admin_3333333333333333';
  const records: Record<string, any> = {
    [`sandboxes/${owned}`]: { app: 'herbal' },
    [`sandboxes/${owned}/counters/docs`]: { app: 'herbal', count: 12 },
    [`sandboxes/${unmarked}`]: {},
    [`sandboxes/${unmarked}/counters/docs`]: { count: 12 },
    [`sandboxes/${foreign}`]: { app: 'tutor' },
    [`sandboxes/${foreign}/counters/docs`]: { app: 'tutor', count: 12 },
    [`sandboxes/${counterForeign}`]: { app: 'herbal' },
    [`sandboxes/${counterForeign}/counters/docs`]: { app: 'other', count: 12 },
    'demo_meta/counters': { ...(rateApp ? { app: rateApp } : {}), dayCount: 4 },
  };
  const deletes: string[] = [], authCalls: string[] = [], seedWrites: string[] = [];
  const doc = (path: string) => ({
    path, id: path.split('/').at(-1),
    get: async () => ({ exists: !!records[path], data: () => records[path] }),
    set: async (data: any) => { records[path] = data; if (path.startsWith('demo_seed/')) seedWrites.push(path); },
  });
  const roots = [owned, unmarked, foreign, counterForeign];
  const db = {
    doc,
    collection: () => ({
      listDocuments: async () => roots.map(uid => doc(`sandboxes/${uid}`)),
      where: (field: string, _op: string, value: string) => ({ get: async () => ({ docs: roots.filter(uid => records[`sandboxes/${uid}`][field] === value).map(uid => ({ id: uid, ref: doc(`sandboxes/${uid}`), data: () => records[`sandboxes/${uid}`] })) }) }),
    }),
    recursiveDelete: async (ref: { path: string }) => { deletes.push(ref.path); },
  };
  const app = { firestore: () => db, auth: () => ({
    listUsers: async () => { authCalls.push('list'); return { users: roots.map(uid => ({ uid })) }; },
    deleteUser: async (uid: string) => { authCalls.push(uid); },
  }) };
  return { owned, unmarked, foreign, counterForeign, records, deletes, authCalls, seedWrites, handlers: loadFunctions({ app }) };
}

describe('Herbal-only reset', () => {
  it('deletes only roots with the exact namespace and both app markers, without touching Auth or generic seeds', async () => {
    const state = fixture();
    await state.handlers.resetDemo();
    expect(state.deletes).toEqual([`sandboxes/${state.owned}`]);
    expect(state.authCalls).toEqual([]);
    expect(state.seedWrites).toEqual([]);
    expect(state.records['demo_meta/counters']).toEqual({ dayCount: 4 });
  });

  it('preserves every rate counter, including an app-marked counter', async () => {
    for (const app of ['herbal', 'other']) {
      const state = fixture(app);
      await state.handlers.resetDemo();
      expect(state.records['demo_meta/counters']).toEqual({ app, dayCount: 4 });
    }
  });
});
