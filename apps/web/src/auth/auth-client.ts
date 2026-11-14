import { createInternalNeonAuth } from '@neon/auth';
import { BetterAuthVanillaAdapter } from '@neon/auth/vanilla/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim();
const neonAuth = authUrl ? createInternalNeonAuth(authUrl) : null;
const emailOtpAdapter = authUrl ? BetterAuthVanillaAdapter()(authUrl) : null;

export const authClient = neonAuth?.adapter ?? null;
export const emailOtpClient = emailOtpAdapter?.getBetterAuthInstance() ?? null;
export const isGoogleLoginEnabled =
  import.meta.env.VITE_GOOGLE_LOGIN_ENABLED !== 'false';

export async function getAuthAccessToken() {
  if (!neonAuth) {
    throw new Error('O login não está configurado neste ambiente.');
  }
  const token = await neonAuth.getJWTToken();
  if (!token) throw new Error('Não foi possível obter o token da sessão.');
  return token;
}
