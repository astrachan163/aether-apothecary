function firestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number' && Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'number') return { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  throw new Error('nesting');
}

function readCount(body) {
  const raw = body?.fields?.count?.integerValue;
  if (raw === undefined) return 0;
  const count = Number(raw);
  if (!Number.isInteger(count)) return null;
  return count;
}

async function commitSandboxItem({ token, projectId, uid, kind, id, data, fetchImpl }) {
  if (!token) throw new Error('missing-token');
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const headers = { authorization: `Bearer ${token}` };
  const current = await fetchImpl(`${base}/sandboxes/${uid}/counters/docs`, { headers });
  if (!current.ok) return current.status;
  const count = readCount(await current.json());
  if (count === null) return 409;
  const itemName = `projects/${projectId}/databases/(default)/documents/sandboxes/${uid}/catalog/${kind}/items/${id}`;
  const item = await fetchImpl(`https://firestore.googleapis.com/v1/${itemName}`, { headers });
  if (!item.ok && item.status !== 404) return item.status;
  const exists = item.ok;
  if (!exists && count >= 200) return 409;
  const fields = {};
  for (const [key, value] of Object.entries(data)) fields[key] = firestoreValue(value);
  const writes = [{ update: { name: itemName, fields }, currentDocument: { exists } }];
  if (!exists) {
    writes.push({
      update: {
        name: `projects/${projectId}/databases/(default)/documents/sandboxes/${uid}/counters/docs`,
        fields: {
          count: { integerValue: String(count + 1) },
          kind: { stringValue: kind },
          itemId: { stringValue: id },
        },
      },
      updateMask: { fieldPaths: ['count', 'kind', 'itemId'] },
    });
  }
  const response = await fetchImpl(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      writes,
    }),
  });
  return response.status;
}

module.exports = { commitSandboxItem };
