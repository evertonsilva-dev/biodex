import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { createAccessTokenVerifier } from './token-verifier.js';

test('Neon Auth JWT issuer is the origin of the configured base URL', async () => {
  const { privateKey, publicKey } = await generateKeyPair('EdDSA');
  const jwk = {
    ...await exportJWK(publicKey),
    kid: 'biodex-test-key',
    alg: 'EdDSA',
    use: 'sig',
  };
  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ keys: [jwk] }));
  });
  server.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  try {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Test JWKS server did not bind to a TCP port.');
    }

    const authBaseUrl = `http://127.0.0.1:${address.port}/neondb/auth`;
    const verifyAccessToken = createAccessTokenVerifier(
      authBaseUrl,
      `http://127.0.0.1:${address.port}/jwks`,
    );
    assert.ok(verifyAccessToken);

    const validToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'EdDSA', kid: 'biodex-test-key' })
      .setIssuer(new URL(authBaseUrl).origin)
      .setSubject('test-user')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);
    assert.equal(await verifyAccessToken(validToken), 'test-user');

    const wrongIssuerToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'EdDSA', kid: 'biodex-test-key' })
      .setIssuer('https://wrong-issuer.example')
      .setSubject('test-user')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);
    assert.equal(await verifyAccessToken(wrongIssuerToken), null);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});
