// Generate scrypt hash untuk seed — jalankan: node scripts/hash-seed.js <password>
import { scrypt } from '@noble/hashes/scrypt.js';
import { randomBytes } from '@noble/hashes/utils.js';

const pw = process.argv[2] ?? 'devpass123';
const salt = randomBytes(16);
const dk = scrypt(new TextEncoder().encode(pw), salt, { N: 16384, r: 8, p: 1, dkLen: 32 });
console.log(`s1$${Buffer.from(salt).toString('base64url')}$${Buffer.from(dk).toString('base64url')}`);
