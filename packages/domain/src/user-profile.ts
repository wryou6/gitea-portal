export type UserProfile = {
  login: string;
  fullName?: string;
  avatarUrl?: string;
};

export type UserProfiles = Record<string, UserProfile>;

export function userDisplayName(user: UserProfile): string {
  return user.fullName?.trim() || user.login;
}

export function userOptionLabel(user: UserProfile): string {
  const name = user.fullName?.trim();
  return name ? `${name} (${user.login})` : user.login;
}

export function userAvatarUrl(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function profileFor(
  profiles: UserProfiles | undefined,
  login: string,
): UserProfile {
  const profile =
    profiles && Object.hasOwn(profiles, login) ? profiles[login] : undefined;
  return profile?.login === login ? profile : { login };
}

export function mergeUserProfiles(
  groups: Array<UserProfiles | undefined>,
): UserProfiles {
  return Object.fromEntries(
    groups.flatMap((group) =>
      Object.entries(group ?? {}).filter(
        ([login, profile]) => profile.login === login,
      ),
    ),
  );
}
