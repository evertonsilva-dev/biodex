import { createRemoteJWKSet, errors, jwtVerify } from 'jose';

export type AccessTokenVerifier = (token: string) => Promise<string | null>;

export function createAccessTokenVerifier(
  authBaseUrl: string,
  jwksUrl: string,
): AccessTokenVerifier | null {
  if (!authBaseUrl || !jwksUrl) return null;

  const issuer = new URL(authBaseUrl).origin;
  const jwks = createRemoteJWKSet(new URL(jwksUrl));
  return async (token) => {
    try {
      const { payload } = await jwtVerify(token, jwks, { issuer });
      return typeof payload.sub === 'string' && payload.sub.length > 0
        ? payload.sub
        : null;
    } catch (error) {
      if (error instanceof errors.JOSEError) return null;
      throw error;
    }
  };
}
