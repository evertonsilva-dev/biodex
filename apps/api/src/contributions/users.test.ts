import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { QueryResultRow } from 'pg';
import { createUserAccessService } from './users.js';

const cpf = '529.982.247-25';
const encryptionKey = Buffer.alloc(32, 7).toString('base64');

test('stores CPF only as a keyed digest and randomized ciphertext', async () => {
  const captured: unknown[][] = [];
  let capturedProfileSql = '';
  const service = createUserAccessService({
    async query<Row extends QueryResultRow = QueryResultRow>(
      sql: string,
      bindings: unknown[] = [],
    ): Promise<{ rows: Row[] }> {
      if (sql.includes('SELECT cpf_last_four')) return { rows: [] };
      capturedProfileSql = sql;
      captured.push(bindings);
      return {
        rows: [{
          birth_date: '1990-04-15',
          profession: 'Bióloga',
          cpf_last_four: '4725',
          professional_council: null,
          professional_registration_number: null,
          professional_registration_status: 'not_submitted',
          registration_verified_at: null,
        } as QueryResultRow] as Row[],
      };
    },
  }, 'root', encryptionKey);

  const profile = await service.updateProfile('user-1', {
    cpf,
    birthDate: '1990-04-15',
    profession: 'Bióloga',
    professionalCouncil: null,
    professionalRegistrationNumber: null,
  });
  const profileBindings = captured[0]!;

  assert.equal(profile.cpfLastFour, '4725');
  assert.equal(profile.professionalRegistrationStatus, 'not_submitted');
  assert.match(capturedProfileSql, /\$7::text/);
  assert.match(capturedProfileSql, /\$8::text/);
  assert.equal(profileBindings.includes(cpf), false);
  assert.equal(typeof profileBindings[1], 'string');
  assert.match(profileBindings[1] as string, /^[a-f0-9]{64}$/);
  assert.equal(typeof profileBindings[2], 'string');
  assert.equal((profileBindings[2] as string).startsWith('v1.'), true);
  assert.equal((profileBindings[2] as string).includes(cpf), false);
});

test('prevents CPF and birth date changes after the profile is saved', async () => {
  const service = createUserAccessService({
    async query<Row extends QueryResultRow = QueryResultRow>(): Promise<{ rows: Row[] }> {
      return {
        rows: [{
          cpf_last_four: '4725',
          birth_date: '1990-04-15',
        } as QueryResultRow] as Row[],
      };
    },
  }, 'root', encryptionKey);

  await assert.rejects(
    service.updateProfile('user-1', {
      cpf,
      birthDate: '1990-04-15',
      profession: 'Bióloga',
      professionalCouncil: null,
      professionalRegistrationNumber: null,
    }),
    /O CPF não pode ser alterado após o primeiro salvamento/,
  );
  await assert.rejects(
    service.updateProfile('user-1', {
      birthDate: '1991-04-15',
      profession: 'Bióloga',
      professionalCouncil: null,
      professionalRegistrationNumber: null,
    }),
    /A data de nascimento não pode ser alterada após o primeiro salvamento/,
  );
});

test('rejects a concurrent profile save that conflicts with immutable fields', async () => {
  let savedProfileSql = '';
  const service = createUserAccessService({
    async query<Row extends QueryResultRow = QueryResultRow>(
      sql: string,
    ): Promise<{ rows: Row[] }> {
      if (sql.includes('SELECT cpf_last_four')) return { rows: [] };
      savedProfileSql = sql;
      return {
        rows: [{
          birth_date: '1990-04-15',
          profession: 'Bióloga',
          cpf_last_four: '1111',
          professional_council: null,
          professional_registration_number: null,
          professional_registration_status: 'not_submitted',
          registration_verified_at: null,
        } as QueryResultRow] as Row[],
      };
    },
  }, 'root', encryptionKey);

  await assert.rejects(
    service.updateProfile('user-1', {
      cpf,
      birthDate: '1990-04-15',
      profession: 'Bióloga',
      professionalCouncil: null,
      professionalRegistrationNumber: null,
    }),
    /O CPF não pode ser alterado após o primeiro salvamento/,
  );
  assert.match(savedProfileSql, /cpf_last_four = saved\.cpf_last_four/);
  assert.match(savedProfileSql, /birth_date = saved\.birth_date/);
});

test('refuses curator assignment unless the professional registration is active', async () => {
  const statements: string[] = [];
  const service = createUserAccessService({
    async query<Row extends QueryResultRow = QueryResultRow>(
      sql: string,
    ): Promise<{ rows: Row[] }> {
      statements.push(sql);
      if (sql.includes('information_schema.columns')) {
        return { rows: [{ column_name: 'id' } as QueryResultRow] as Row[] };
      }
      if (sql.includes('neon_auth."user"')) {
        return { rows: [{ exists: 1 } as QueryResultRow] as Row[] };
      }
      if (sql.includes('FROM public.app_user_roles')) {
        return { rows: [{ role: 'user' } as QueryResultRow] as Row[] };
      }
      if (sql.includes('INSERT INTO public.app_user_roles')) {
        return { rows: [] };
      }
      throw new Error('Unexpected query in user access test.');
    },
  }, 'root', encryptionKey);

  await assert.rejects(
    service.setRole('root', 'curator-user', 'curator'),
    /registro profissional validado como ativo/,
  );
  assert.match(statements.at(-1) ?? '', /professional_registration_status = 'active'/);
});
