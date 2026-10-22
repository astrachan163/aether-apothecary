export function acceptPublishableTestKey(key: string | undefined | null): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (!trimmed.startsWith('pk_test_')) return null;
  if (trimmed.includes('pk_live_') || trimmed.includes('sk_')) return null;
  return trimmed;
}

export function assertSecretTestKey(key: string | undefined | null): asserts key is string {
  if (!key || !key.startsWith('sk_test_') || key.includes('sk_live_')) {
    const error = new Error('failed-precondition');
    error.name = 'failed-precondition';
    throw error;
  }
}
