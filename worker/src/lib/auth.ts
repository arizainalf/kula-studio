// ponytail: hash via @noble/hashes scrypt (Workers-compatible, no native).
// Token = HMAC-SHA256 payload base64url — stateless, tambah tabel sessions kalau butuh revoke.
import { scrypt } from '@noble/hashes/scrypt.js';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';

const SCRYPT = { N: 16384, r: 8, p: 1, dkLen: 32 };
const enc = new TextEncoder();
const te = (s: string): Uint8Array => enc.encode(s);

export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const dk = scrypt(te(pw), salt, SCRYPT);
  return `s1$${Buffer.from(salt).toString('base64url')}$${Buffer.from(dk).toString('base64url')}`;
}

function eq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i] ^ b[i];
  return r === 0;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [v, s, h] = stored.split('$');
  if (v !== 's1') return false;
  const dk = scrypt(te(pw), new Uint8Array(Buffer.from(s, 'base64url')), SCRYPT);
  return eq(dk, new Uint8Array(Buffer.from(h, 'base64url')));
}

const b64u = (b: Uint8Array) => Buffer.from(b).toString('base64url');
const fromB64u = (s: string) => new Uint8Array(Buffer.from(s, 'base64url'));
const mac64 = (secret: string, body: string) => b64u(hmac(sha256, te(secret), te(body)));

export function signToken(payload: object, secret: string): string {
  const body = b64u(te(JSON.stringify(payload)));
  return `${body}.${mac64(secret, body)}`;
}

export function verifyToken<T>(token: string, secret: string): T | null {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  if (!eq(fromB64u(mac), fromB64u(mac64(secret, body)))) return null;
  try { return JSON.parse(new TextDecoder().decode(fromB64u(body))) as T; } catch { return null; }
}
