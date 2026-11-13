import type { QueryResultRow } from 'pg';
import { createProfileSecurity, normalizeCpf } from './profile-security.js';
import { HttpError } from '../http/errors.js';
import {
  canAssignRole,
  type AccountRole,
  type StoredAccountRole,
} from '../auth/roles.js';

interface Database {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<{ rows: Row[] }>;
}

interface RoleRow extends QueryResultRow {
  role: StoredAccountRole;
}

interface UserRow extends QueryResultRow {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: AccountRole;
  created_at: string | null;
  last_seen_at: string | null;
  profession: string | null;
  professional_council: string | null;
  professional_registration_number: string | null;
  professional_registration_status: ProfessionalRegistrationStatus;
  registration_verified_at: string | null;
}

interface UserProfileRow extends QueryResultRow {
  birth_date: string | null;
  profession: string | null;
  cpf_last_four: string | null;
  professional_council: string | null;
  professional_registration_number: string | null;
  professional_registration_status: ProfessionalRegistrationStatus;
  registration_verified_at: string | null;
}

export type ProfessionalRegistrationStatus =
  | 'not_submitted'
  | 'pending'
  | 'active'
  | 'rejected';

export interface UpdateUserProfileInput {
  cpf?: string;
  birthDate: string;
  profession: string;
  professionalCouncil: string | null;
  professionalRegistrationNumber: string | null;
}

export interface ManagedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: AccountRole;
  createdAt: string | null;
  lastSeenAt: string | null;
  profession: string | null;
  professionalCouncil: string | null;
  professionalRegistrationNumber: string | null;
  professionalRegistrationStatus: ProfessionalRegistrationStatus;
  registrationVerifiedAt: string | null;
}

export interface UserProfile {
  birthDate: string | null;
  profession: string | null;
  cpfLastFour: string | null;
  professionalCouncil: string | null;
  professionalRegistrationNumber: string | null;
  professionalRegistrationStatus: ProfessionalRegistrationStatus;
  registrationVerifiedAt: string | null;
}

export interface CurrentAccount {
  userId: string;
  role: AccountRole;
}

const AUTH_USER_COLUMNS_SQL = `
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'neon_auth'
    AND table_name = 'user'
`;

function quoteColumn(column: string): string {
  return `"${column.replaceAll('"', '""')}"`;
}

function authColumnExpression(
  columns: Set<string>,
  candidates: string[],
  alias: string,
): string {
  const column = candidates.find((candidate) => columns.has(candidate));
  return column
    ? `auth_user.${quoteColumn(column)}::text AS ${quoteColumn(alias)}`
    : `NULL::text AS ${quoteColumn(alias)}`;
}

export function createUserAccessService(
  db: Database,
  rootUserId: string,
  cpfEncryptionKey = '',
) {
  const profileSecurity = cpfEncryptionKey.trim()
    ? createProfileSecurity(cpfEncryptionKey)
    : null;

  async function getAuthUserColumns(): Promise<Set<string>> {
    const result = await db.query<{ column_name: string }>(AUTH_USER_COLUMNS_SQL);
    return new Set(result.rows.map(({ column_name }) => column_name));
  }

  async function getStoredRole(userId: string): Promise<StoredAccountRole> {
    const result = await db.query<RoleRow>(
      `SELECT CASE
         WHEN role = 'curator' AND NOT EXISTS (
           SELECT 1
           FROM public.app_user_profiles profile
           WHERE profile.user_id = app_user_roles.user_id
             AND profile.professional_registration_status = 'active'
             AND profile.professional_council IS NOT NULL
             AND profile.professional_registration_number IS NOT NULL
         ) THEN 'user'
         ELSE role
       END AS role
       FROM public.app_user_roles
       WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0]?.role ?? 'user';
  }

  function toUserProfile(row: UserProfileRow | undefined): UserProfile {
    const birthDate = row?.birth_date?.slice(0, 10) ?? null;
    return {
      birthDate,
      profession: row?.profession ?? null,
      cpfLastFour: row?.cpf_last_four ?? null,
      professionalCouncil: row?.professional_council ?? null,
      professionalRegistrationNumber: row?.professional_registration_number ?? null,
      professionalRegistrationStatus: row?.professional_registration_status ?? 'not_submitted',
      registrationVerifiedAt: row?.registration_verified_at ?? null,
    };
  }

  async function hasKnownUser(
    userId: string,
    authUserColumns: Set<string>,
  ): Promise<boolean> {
    if (authUserColumns.has('id')) {
      const result = await db.query(
        'SELECT 1 FROM neon_auth."user" WHERE "id"::text = $1 LIMIT 1',
        [userId],
      );
      return result.rows.length > 0;
    }

    const result = await db.query(
      'SELECT 1 FROM public.app_user_roles WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    return result.rows.length > 0;
  }

  return {
    async getCurrentAccount(userId: string): Promise<CurrentAccount> {
      await db.query(
        `INSERT INTO public.app_user_roles (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET last_seen_at = now()`,
        [userId],
      );
      return {
        userId,
        role: userId === rootUserId ? 'root' : await getStoredRole(userId),
      };
    },

    async getProfile(userId: string): Promise<UserProfile> {
      const result = await db.query<UserProfileRow>(
        `SELECT
           birth_date::text AS birth_date,
           profession,
           cpf_last_four,
           professional_council,
           professional_registration_number,
           professional_registration_status,
           registration_verified_at::text AS registration_verified_at
         FROM public.app_user_profiles
         WHERE user_id = $1`,
        [userId],
      );
      return toUserProfile(result.rows[0]);
    },

    async updateProfile(
      userId: string,
      input: UpdateUserProfileInput,
    ): Promise<UserProfile> {
      const current = await db.query<{
        cpf_last_four: string;
        birth_date: string;
      }>(
        `SELECT cpf_last_four, birth_date::text AS birth_date
         FROM public.app_user_profiles
         WHERE user_id = $1`,
        [userId],
      );
      const currentProfile = current.rows[0];
      let cpfHash: string | null = null;
      let cpfCiphertext: string | null = null;
      let cpfLastFour: string | null = null;
      const submittedCpf = input.cpf?.trim();

      if (currentProfile && submittedCpf) {
        throw new HttpError(409, 'O CPF não pode ser alterado após o primeiro salvamento.');
      }
      if (currentProfile && currentProfile.birth_date.slice(0, 10) !== input.birthDate) {
        throw new HttpError(409, 'A data de nascimento não pode ser alterada após o primeiro salvamento.');
      }

      if (submittedCpf) {
        const cpf = normalizeCpf(submittedCpf);
        if (!cpf) throw new HttpError(400, 'Informe um CPF válido.');
        if (!profileSecurity) {
          throw new HttpError(503, 'O cadastro seguro de CPF não está configurado neste ambiente.');
        }
        cpfHash = profileSecurity.digestCpf(cpf);
        cpfCiphertext = profileSecurity.encryptCpf(cpf);
        cpfLastFour = cpf.slice(-4);
      } else if (!currentProfile) {
        throw new HttpError(400, 'Informe seu CPF para completar o perfil.');
      }

      let result: { rows: UserProfileRow[] };
      try {
        result = await db.query<UserProfileRow>(
          `WITH saved_profile AS (
             INSERT INTO public.app_user_profiles AS saved (
               user_id,
               cpf_hash,
               cpf_ciphertext,
               cpf_last_four,
               birth_date,
               profession,
               professional_council,
               professional_registration_number,
               professional_registration_status
             )
             VALUES (
               $1,
               COALESCE($2, (SELECT profile.cpf_hash FROM public.app_user_profiles profile WHERE profile.user_id = $1)),
               COALESCE($3, (SELECT profile.cpf_ciphertext FROM public.app_user_profiles profile WHERE profile.user_id = $1)),
               COALESCE($4, (SELECT profile.cpf_last_four FROM public.app_user_profiles profile WHERE profile.user_id = $1)),
               $5::date,
               $6,
               $7::text,
               $8::text,
               CASE
                 WHEN $7::text IS NOT NULL AND $8::text IS NOT NULL THEN 'pending'
                 ELSE 'not_submitted'
               END
             )
             ON CONFLICT (user_id) DO UPDATE SET
               cpf_hash = saved.cpf_hash,
               cpf_ciphertext = saved.cpf_ciphertext,
               cpf_last_four = saved.cpf_last_four,
               birth_date = saved.birth_date,
               profession = EXCLUDED.profession,
               professional_council = EXCLUDED.professional_council,
               professional_registration_number = EXCLUDED.professional_registration_number,
               professional_registration_status = CASE
                 WHEN saved.professional_registration_status = 'rejected'
                   OR saved.professional_council IS DISTINCT FROM EXCLUDED.professional_council
                   OR saved.professional_registration_number IS DISTINCT FROM EXCLUDED.professional_registration_number
                 THEN CASE
                   WHEN EXCLUDED.professional_council IS NOT NULL
                     AND EXCLUDED.professional_registration_number IS NOT NULL
                   THEN 'pending'
                   ELSE 'not_submitted'
                 END
                 ELSE saved.professional_registration_status
               END,
               registration_verified_by = CASE
                 WHEN saved.professional_registration_status = 'rejected'
                   OR saved.professional_council IS DISTINCT FROM EXCLUDED.professional_council
                   OR saved.professional_registration_number IS DISTINCT FROM EXCLUDED.professional_registration_number
                 THEN NULL
                 ELSE saved.registration_verified_by
               END,
               registration_verified_at = CASE
                 WHEN saved.professional_registration_status = 'rejected'
                   OR saved.professional_council IS DISTINCT FROM EXCLUDED.professional_council
                   OR saved.professional_registration_number IS DISTINCT FROM EXCLUDED.professional_registration_number
                 THEN NULL
                 ELSE saved.registration_verified_at
               END,
               updated_at = now()
             RETURNING *
           ), demoted_curator AS (
             UPDATE public.app_user_roles access
             SET role = 'user', updated_at = now()
             FROM saved_profile profile
             WHERE access.user_id = profile.user_id
               AND access.role = 'curator'
               AND profile.professional_registration_status <> 'active'
             RETURNING access.user_id
           )
           SELECT
             birth_date::text AS birth_date,
             profession,
             cpf_last_four,
             professional_council,
             professional_registration_number,
             professional_registration_status,
             registration_verified_at::text AS registration_verified_at
           FROM saved_profile`,
          [
            userId,
            cpfHash,
            cpfCiphertext,
            cpfLastFour,
            input.birthDate,
            input.profession,
            input.professionalCouncil,
            input.professionalRegistrationNumber,
          ],
        );
      } catch (error) {
        if (
          typeof error === 'object'
          && error !== null
          && 'code' in error
          && error.code === '23505'
        ) {
          throw new HttpError(409, 'Este CPF já está associado a outra conta.');
        }
        throw error;
      }
      const savedProfile = result.rows[0];
      if (
        savedProfile
        && savedProfile.birth_date?.slice(0, 10) !== input.birthDate
      ) {
        throw new HttpError(409, 'A data de nascimento não pode ser alterada após o primeiro salvamento.');
      }
      if (savedProfile && cpfLastFour && savedProfile.cpf_last_four !== cpfLastFour) {
        throw new HttpError(409, 'O CPF não pode ser alterado após o primeiro salvamento.');
      }
      return toUserProfile(result.rows[0]);
    },

    async reviewProfessionalRegistration(
      userId: string,
      reviewerId: string,
      status: Extract<ProfessionalRegistrationStatus, 'active' | 'rejected'>,
    ): Promise<void> {
      const result = await db.query<{ user_id: string }>(
        `WITH reviewed_profile AS (
           UPDATE public.app_user_profiles
           SET professional_registration_status = $3,
               registration_verified_by = $2,
               registration_verified_at = now(),
               updated_at = now()
           WHERE user_id = $1
             AND professional_registration_status = 'pending'
             AND professional_council IS NOT NULL
             AND professional_registration_number IS NOT NULL
           RETURNING user_id
         ), demoted_curator AS (
           UPDATE public.app_user_roles access
           SET role = 'user', updated_at = now()
           FROM reviewed_profile profile
           WHERE access.user_id = profile.user_id
             AND access.role = 'curator'
           RETURNING access.user_id
         )
         SELECT user_id FROM reviewed_profile`,
        [userId, reviewerId, status],
      );
      if (!result.rows[0]) {
        throw new HttpError(409, 'Não há um registro profissional pendente para revisar.');
      }
    },

    async listUsers(): Promise<ManagedUser[]> {
      const authUserColumns = await getAuthUserColumns();
      const result = authUserColumns.has('id')
        ? await db.query<UserRow>(
            `SELECT
               auth_user."id"::text AS user_id,
               ${authColumnExpression(authUserColumns, ['name'], 'display_name')},
               ${authColumnExpression(authUserColumns, ['email'], 'email')},
               CASE
                 WHEN auth_user."id"::text = $1 AND $1 <> '' THEN 'root'
                 WHEN access.role = 'curator'
                   AND profile.professional_registration_status = 'active'
                   AND profile.professional_council IS NOT NULL
                   AND profile.professional_registration_number IS NOT NULL THEN 'curator'
                 WHEN access.role = 'curator' THEN 'user'
                 ELSE COALESCE(access.role, 'user')
               END AS role,
               COALESCE(
                 ${authColumnExpression(authUserColumns, ['createdAt', 'created_at'], 'auth_created_at')
                   .replace(/ AS "auth_created_at"$/, '')},
                 access.created_at::text
               ) AS created_at,
               access.last_seen_at::text AS last_seen_at,
               profile.profession,
               profile.professional_council,
               profile.professional_registration_number,
               COALESCE(profile.professional_registration_status, 'not_submitted')
                 AS professional_registration_status,
               profile.registration_verified_at::text AS registration_verified_at
             FROM neon_auth."user" auth_user
             LEFT JOIN public.app_user_roles access
               ON access.user_id = auth_user."id"::text
             LEFT JOIN public.app_user_profiles profile
               ON profile.user_id = auth_user."id"::text
             ORDER BY COALESCE(access.last_seen_at, access.created_at) DESC NULLS LAST,
               auth_user."id"::text`,
            [rootUserId],
          )
        : await db.query<UserRow>(
            `SELECT
              access.user_id,
               NULL::text AS display_name,
               NULL::text AS email,
              CASE
                WHEN access.user_id = $1 AND $1 <> '' THEN 'root'
                WHEN access.role = 'curator'
                  AND profile.professional_registration_status = 'active'
                  AND profile.professional_council IS NOT NULL
                  AND profile.professional_registration_number IS NOT NULL THEN 'curator'
                WHEN access.role = 'curator' THEN 'user'
                ELSE access.role
              END AS role,
              access.created_at::text AS created_at,
              access.last_seen_at::text AS last_seen_at,
               profile.profession,
               profile.professional_council,
               profile.professional_registration_number,
               COALESCE(profile.professional_registration_status, 'not_submitted')
                 AS professional_registration_status,
               profile.registration_verified_at::text AS registration_verified_at
             FROM public.app_user_roles access
             LEFT JOIN public.app_user_profiles profile
               ON profile.user_id = access.user_id
             ORDER BY access.last_seen_at DESC, access.user_id`,
            [rootUserId],
          );
      const users = result.rows.map((row) => ({
        id: row.user_id,
        name: row.display_name,
        email: row.email,
        role: row.role === 'root' ? 'root' as const : row.role,
        createdAt: row.created_at,
        lastSeenAt: row.last_seen_at,
        profession: row.profession,
        professionalCouncil: row.professional_council,
        professionalRegistrationNumber: row.professional_registration_number,
        professionalRegistrationStatus: row.professional_registration_status,
        registrationVerifiedAt: row.registration_verified_at,
      }));

      if (rootUserId && !users.some(({ id }) => id === rootUserId)) {
        users.push({
          id: rootUserId,
          name: null,
          email: null,
          role: 'root',
          createdAt: null,
          lastSeenAt: null,
          profession: null,
          professionalCouncil: null,
          professionalRegistrationNumber: null,
          professionalRegistrationStatus: 'not_submitted',
          registrationVerifiedAt: null,
        });
      }

      return users;
    },

    async setRole(
      actorId: string,
      targetId: string,
      targetRole: StoredAccountRole,
    ): Promise<void> {
      const actorRole: AccountRole = actorId === rootUserId
        ? 'root'
        : await getStoredRole(actorId);
      if (!canAssignRole(actorRole, targetRole)) {
        throw new HttpError(403, 'Você não tem permissão para alterar este nível de acesso.');
      }
      if (targetId === rootUserId || targetId === actorId) {
        throw new HttpError(400, 'Não é possível alterar o próprio nível de acesso ou o do root.');
      }
      if (actorRole === 'admin' && targetRole !== 'curator') {
        throw new HttpError(403, 'Admins só podem conceder o nível de curador.');
      }

      const authUserColumns = await getAuthUserColumns();
      if (!(await hasKnownUser(targetId, authUserColumns))) {
        throw new HttpError(404, 'Usuário não encontrado.');
      }
      const currentRole = await getStoredRole(targetId);
      if (actorRole === 'admin' && currentRole !== 'user') {
        throw new HttpError(409, 'Admins só podem conceder curadoria a usuários comuns.');
      }

      const result = await db.query<{ user_id: string }>(
        `INSERT INTO public.app_user_roles (user_id, role)
         SELECT $1, $2
         WHERE $2 <> 'curator'
            OR EXISTS (
              SELECT 1
              FROM public.app_user_profiles profile
              WHERE profile.user_id = $1
                AND profile.birth_date IS NOT NULL
                AND profile.profession IS NOT NULL
                AND profile.professional_registration_status = 'active'
                AND profile.professional_council IS NOT NULL
                AND profile.professional_registration_number IS NOT NULL
            )
         ON CONFLICT (user_id) DO UPDATE
         SET role = EXCLUDED.role, updated_at = now(), last_seen_at = now()
         RETURNING user_id`,
        [targetId, targetRole],
      );
      if (!result.rows[0]) {
        throw new HttpError(
          409,
          'Para receber curadoria, o usuário precisa completar o perfil e ter registro profissional validado como ativo.',
        );
      }
    },
  };
}

export type UserAccessService = ReturnType<typeof createUserAccessService>;
