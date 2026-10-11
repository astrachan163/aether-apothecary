import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_PASSWORD_LENGTH = 200;
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first;
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 1000) {
    const oldest = attempts.keys().next().value;
    if (oldest) attempts.delete(oldest);
  }
  return false;
}

export async function POST(request: Request) {
  const configured = process.env.ADMIN_PASSWORD ?? '';
  if (!configured) {
    return NextResponse.json(
      { error: 'Admin login is not configured.' },
      { status: 503 },
    );
  }

  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  let password = '';
  try {
    const body: unknown = await request.json();
    if (
      body &&
      typeof body === 'object' &&
      'password' in body &&
      typeof body.password === 'string'
    ) {
      password = body.password;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  const matches = timingSafeEqual(digest(password), digest(configured));
  if (!matches) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
