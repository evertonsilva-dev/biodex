import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProfileSecurity, normalizeCpf } from './profile-security.js';

test('normalizes and validates Brazilian CPF check digits', () => {
  assert.equal(normalizeCpf('529.982.247-25'), '52998224725');
  assert.equal(normalizeCpf('52998224725'), '52998224725');
  assert.equal(normalizeCpf('111.111.111-11'), null);
  assert.equal(normalizeCpf('529.982.247-24'), null);
  assert.equal(normalizeCpf('5299822472a'), null);
});

test('CPF encryption uses randomized ciphertext and a keyed lookup digest', () => {
  const key = Buffer.alloc(32, 7).toString('base64');
  const first = createProfileSecurity(key);
  const second = createProfileSecurity(key);
  const cpf = '52998224725';

  assert.equal(first.digestCpf(cpf), second.digestCpf(cpf));
  assert.notEqual(first.encryptCpf(cpf), first.encryptCpf(cpf));
  assert.notEqual(first.digestCpf(cpf), createProfileSecurity(
    Buffer.alloc(32, 8).toString('base64'),
  ).digestCpf(cpf));
});

test('rejects invalid CPF encryption keys', () => {
  assert.throws(() => createProfileSecurity('not-a-key'), /32-byte key/);
});
