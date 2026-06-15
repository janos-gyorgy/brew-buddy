import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { users } from '../schema.js';
import { hashPassword, verifyPassword, issueSession, clearSession, authMiddleware } from '../auth.js';
import type { AppEnv } from '../types.js';

const router = new Hono<AppEnv>();

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

const publicUser = (u: typeof users.$inferSelect) => ({
  id: u.id,
  username: u.username,
  onboarded: u.onboarded,
});

router.post('/register', async (c) => {
  const { username, password, inviteCode } = await c.req.json();

  const expected = process.env.INVITE_CODE;
  if (!expected) return c.json({ message: 'Registration is currently closed.' }, 403);
  if (inviteCode !== expected) return c.json({ message: 'Invalid invite code.' }, 403);

  if (typeof username !== 'string' || !USERNAME_RE.test(username))
    return c.json({ message: 'Username must be 3–32 characters (letters, numbers, . _ -).' }, 400);
  if (typeof password !== 'string' || password.length < 8)
    return c.json({ message: 'Password must be at least 8 characters.' }, 400);

  const existing = await db.select().from(users).where(eq(users.username, username));
  if (existing[0]) return c.json({ message: 'That username is already taken.' }, 409);

  const password_hash = await hashPassword(password);
  const [user] = await db.insert(users).values({ username, password_hash }).returning();
  await issueSession(c, user.id);
  return c.json(publicUser(user), 201);
});

router.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  if (typeof username !== 'string' || typeof password !== 'string')
    return c.json({ message: 'Username and password are required.' }, 400);

  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user || !(await verifyPassword(password, user.password_hash)))
    return c.json({ message: 'Wrong username or password.' }, 401);

  await issueSession(c, user.id);
  return c.json(publicUser(user));
});

router.post('/logout', (c) => {
  clearSession(c);
  return c.json({ success: true });
});

router.get('/me', authMiddleware, async (c) => {
  const [user] = await db.select().from(users).where(eq(users.id, c.get('userId')));
  if (!user) return c.json({ message: 'Unauthorized' }, 401);
  return c.json(publicUser(user));
});

router.post('/onboarded', authMiddleware, async (c) => {
  await db.update(users).set({ onboarded: true }).where(eq(users.id, c.get('userId')));
  return c.json({ success: true });
});

export default router;
