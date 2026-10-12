function firestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number' && Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === 'number') return { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  throw new Error('nesting');
}

async function commitSandboxItem({ token, projectId, uid, kind, id, data, fetchImpl }) {
  if (!token) throw new Error('missing-token');
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const headers = { authorization: `Bearer ${token}` };
  const current = await fetchImpl(`${base}/sandboxes/${uid}/counters/docs`, { headers });
  if (!current.ok) return current.status;
  const body = await current.json();
  const ids = (body.fields?.ids?.arrayValue?.values || []).map((entry) => entry.stringValue).filter(Boolean);
  const slot = `${kind}/${id}`;
  if (ids.includes(slot) || ids.length >= 200) return 409;
  const fields = {};
  for (const [key, value] of Object.entries(data)) fields[key] = firestoreValue(value);
  const response = await fetchImpl(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `projects/${projectId}/databases/(default)/documents/sandboxes/${uid}/catalog/${kind}/items/${id}`,
            fields,
          },
        },
        {
          update: {
            name: `projects/${projectId}/databases/(default)/documents/sandboxes/${uid}/counters/docs`,
            fields: {
              ids: { arrayValue: { values: [...ids, slot].map((entry) => ({ stringValue: entry })) } },
            },
          },
        },
      ],
    }),
  });
  return response.status;
}

module.exports = { commitSandboxItem };
