import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import bcrypt from 'bcryptjs';
import type { Context, MiddlewareHandler } from 'hono';
import type { AppEnv } from './types.js';

const COOKIE = 'bb_session';
const SECURE = process.env.NODE_ENV === 'production';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    if (SECURE) throw new Error('SESSION_SECRET is required in production');
    return 'dev-insecure-secret-change-me';
  }
  return s;
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function issueSession(c: Context, userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const token = await sign({ sub: userId, exp }, secret(), 'HS256');
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: SECURE,
    sameSite: 'Lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function clearSession(c: Context) {
  deleteCookie(c, COOKIE, { path: '/' });
}

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = getCookie(c, COOKIE);
  if (!token) return c.json({ message: 'Unauthorized' }, 401);
  try {
    const payload = await verify(token, secret(), 'HS256');
    c.set('userId', payload.sub as string);
  } catch {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  await next();
};
