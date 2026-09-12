import type { ExtendedProfile, UserRole } from '@/types/auth.types';

export function getProfileRoles(
  profile: Pick<ExtendedProfile, 'role' | 'roles'> | null | undefined
): UserRole[] {
  if (!profile) return [];

  const roleSet = new Set<UserRole>();
  if (profile.role) roleSet.add(profile.role);
  profile.roles?.forEach((entry) => {
    if (entry.role) roleSet.add(entry.role);
  });
  return Array.from(roleSet);
}

export function profileHasRole(
  profile: Pick<ExtendedProfile, 'role' | 'roles'> | null | undefined,
  role: UserRole
): boolean {
  return getProfileRoles(profile).includes(role);
}

export function profileHasAnyRole(
  profile: Pick<ExtendedProfile, 'role' | 'roles'> | null | undefined,
  roles: UserRole[]
): boolean {
  const owned = getProfileRoles(profile);
  return roles.some((role) => owned.includes(role));
}
