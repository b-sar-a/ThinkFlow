import type { DeletionDb } from '../../server/accountDeletion';

/**
 * A small in-memory stand-in for the Firestore Admin API, covering exactly what the server
 * modules use: documents (get/set with merge/delete), equality and array-contains queries with
 * limit, collection-group queries, recursiveDelete and transactions.
 */
export function createFakeDb() {
  const store = new Map<string, any>();
  let groupQueryFails = false;

  const idOf = (path: string) => path.split('/').pop()!;
  const depth = (path: string) => path.split('/').length;

  const snap = (path: string) => ({ exists: store.has(path), id: idOf(path), data: () => store.get(path) });

  const merge = (prev: any, next: any) => {
    const out: any = { ...prev };
    for (const [key, value] of Object.entries(next)) {
      const isMap = value && typeof value === 'object' && !Array.isArray(value);
      out[key] = isMap ? { ...(prev?.[key] || {}), ...(value as object) } : value;
    }
    return out;
  };

  const ref = (path: string) => ({
    path,
    get: async () => snap(path),
    set: async (data: any, options?: { merge?: boolean }) => {
      store.set(path, options?.merge ? merge(store.get(path) || {}, data) : data);
    },
    delete: async () => {
      store.delete(path);
    },
  });

  const matches = (doc: any, field: string, op: string, value: any) =>
    op === 'array-contains' ? Array.isArray(doc?.[field]) && doc[field].includes(value) : doc?.[field] === value;

  const query = (paths: () => string[], field: string, op: string, value: any, max = Number.MAX_SAFE_INTEGER): any => ({
    limit: (n: number) => query(paths, field, op, value, n),
    get: async () => {
      const docs = paths()
        .filter((p) => matches(store.get(p), field, op, value))
        .slice(0, max)
        .map((p) => ({ ...snap(p), ref: ref(p) }));
      return { docs, size: docs.length };
    },
  });

  const directChildren = (collection: string) => () =>
    [...store.keys()].filter((p) => p.startsWith(collection + '/') && depth(p) === depth(collection) + 1);

  const db = {
    doc: (path: string) => ref(path),
    collection: (name: string) => ({
      where: (field: string, op: string, value: any) => query(directChildren(name), field, op, value),
    }),
    collectionGroup: (id: string) => {
      if (groupQueryFails) throw new Error('FAILED_PRECONDITION: the query requires an index');
      return {
        where: (field: string, op: string, value: any) =>
          query(() => [...store.keys()].filter((p) => depth(p) % 2 === 0 && p.split('/').at(-2) === id), field, op, value),
      };
    },
    recursiveDelete: async (target: { path: string }) => {
      for (const key of [...store.keys()]) if (key === target.path || key.startsWith(target.path + '/')) store.delete(key);
    },
    // Not atomic: the logic under test must be correct on its own, the fake only runs it.
    runTransaction: async (fn: (tx: any) => Promise<any>) =>
      fn({ get: (r: any) => r.get(), set: (r: any, d: any, o: any) => r.set(d, o), delete: (r: any) => r.delete() }),
  } as unknown as DeletionDb;

  return {
    db,
    store,
    has: (path: string) => store.has(path),
    count: (prefix: string) => [...store.keys()].filter((k) => k.startsWith(prefix)).length,
    /** Simulates a missing collection-group index. */
    setGroupQueryFails: (value: boolean) => {
      groupQueryFails = value;
    },
  };
}
