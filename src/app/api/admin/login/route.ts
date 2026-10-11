import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_PASSWORD_LENGTH = 200;

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export async function POST(request: Request) {
  const configured = process.env.ADMIN_PASSWORD ?? '';
  if (!configured) {
    return NextResponse.json(
      { error: 'Admin login is not configured.' },
      { status: 503 },
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
