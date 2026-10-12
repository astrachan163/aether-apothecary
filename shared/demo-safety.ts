const DEMO_UID = /^demo_[a-z0-9-]+_[a-f0-9]{16}$/;

export function isDemoUid(uid: string): boolean {
  return uid.startsWith('demo_');
}

export function mayResetAuthUser(uid: string): boolean {
  return isDemoUid(uid) && uid !== 'admin' && !uid.includes('strachan');
}

export function mayDeleteFirestorePath(path: string): boolean {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'org') return false;
  if (parts[0] !== 'sandboxes' || !parts[1]) return false;
  return isDemoUid(parts[1]);
}

export function buildDemoUid(role: string, hex: string): string {
  if (!/^[a-f0-9]{16}$/.test(hex)) {
    throw new Error('bad-hex');
  }
  if (!/^[a-z0-9-]+$/.test(role)) {
    throw new Error('bad-role');
  }
  const uid = `demo_${role}_${hex}`;
  if (!DEMO_UID.test(uid)) throw new Error('bad-uid');
  return uid;
}

export function sandboxExpiresAt(nowMs: number): number {
  return nowMs + 24 * 60 * 60 * 1000;
}

export type DemoCounter = {
  day: string;
  dayCount: number;
  clients: Record<string, { hour: string; count: number }>;
};

export function assertDemoCapacity(counter: DemoCounter, clientHash: string, now: Date, limits = { day: 300, hour: 5 }): DemoCounter {
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(0, 13);
  const dayCount = counter.day === day ? counter.dayCount : 0;
  if (dayCount >= limits.day) {
    throw new Error('resource-exhausted');
  }
  const current = counter.clients[clientHash];
  const hourCount = current && current.hour === hour ? current.count : 0;
  if (hourCount >= limits.hour) {
    throw new Error('resource-exhausted');
  }
  return {
    day,
    dayCount: dayCount + 1,
    clients: {
      ...counter.clients,
      [clientHash]: { hour, count: hourCount + 1 },
    },
  };
}
