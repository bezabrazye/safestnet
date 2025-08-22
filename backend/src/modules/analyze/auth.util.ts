import { createHmac, randomBytes } from 'crypto';

export interface AdminTokenPayload {
  sub: string; // username
  iat: number; // issued at (unix seconds)
  exp: number; // expiration (unix seconds)
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function signAdminToken(payload: AdminTokenPayload, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encHeader = base64url(JSON.stringify(header));
  const encPayload = base64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const sig = createHmac('sha256', secret).update(data).digest();
  const encSig = base64url(sig);
  return `${data}.${encSig}`;
}

export function verifyAdminToken(token: string, secret: string): AdminTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encHeader, encPayload, encSig] = parts;
  const data = `${encHeader}.${encPayload}`;
  const expected = base64url(createHmac('sha256', secret).update(data).digest());
  if (expected !== encSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encPayload, 'base64').toString('utf8')) as AdminTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}


