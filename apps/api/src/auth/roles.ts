export const ACCOUNT_ROLES = ['user', 'curator', 'admin', 'root'] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];
export type StoredAccountRole = Exclude<AccountRole, 'root'>;

export function canReviewPhotoSuggestions(role: AccountRole): boolean {
  return role === 'admin' || role === 'root';
}

export function canViewUsers(role: AccountRole): boolean {
  return role === 'admin' || role === 'root';
}

export function canAssignRole(
  actorRole: AccountRole,
  targetRole: StoredAccountRole,
): boolean {
  if (actorRole === 'root') return true;
  return actorRole === 'admin' && targetRole === 'curator';
}

export function canCreateEditorialContent(role: AccountRole): boolean {
  return role === 'curator' || role === 'root';
}

export function canEditEditorialContent(
  role: AccountRole,
  actorId: string,
  ownerId: string | null,
): boolean {
  return role === 'root' || (role === 'curator' && ownerId === actorId);
}

export function canDeleteEditorialContent(role: AccountRole): boolean {
  return role === 'admin' || role === 'root';
}
