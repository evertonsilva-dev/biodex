import { createCipheriv, createHmac, randomBytes } from 'node:crypto';

const CPF_ENCRYPTION_KEY_LENGTH = 32;

export function normalizeCpf(value: string): string | null {
  const trimmed = value.trim();
  if (!/^[\d.\-\s]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return null;

  const calculateDigit = (prefix: string, length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(prefix[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  if (
    calculateDigit(digits, 9) !== Number(digits[9])
    || calculateDigit(digits, 10) !== Number(digits[10])
  ) {
    return null;
  }
  return digits;
}

export function createProfileSecurity(encodedKey: string) {
  const keyText = encodedKey.trim();
  const masterKey = Buffer.from(keyText, 'base64');
  if (
    masterKey.length !== CPF_ENCRYPTION_KEY_LENGTH
    || masterKey.toString('base64') !== keyText
  ) {
    throw new Error('CPF_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
  }

  const digestKey = createHmac('sha256', masterKey)
    .update('biodex:user-profile:cpf-lookup:v1')
    .digest();
  const encryptionKey = createHmac('sha256', masterKey)
    .update('biodex:user-profile:cpf-encryption:v1')
    .digest();

  return {
    digestCpf(cpf: string): string {
      return createHmac('sha256', digestKey).update(cpf).digest('hex');
    },

    encryptCpf(cpf: string): string {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
      const ciphertext = Buffer.concat([
        cipher.update(cpf, 'utf8'),
        cipher.final(),
      ]);
      return [
        'v1',
        iv.toString('base64url'),
        cipher.getAuthTag().toString('base64url'),
        ciphertext.toString('base64url'),
      ].join('.');
    },
  };
}
