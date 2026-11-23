/**
 * GitHub serves every account's avatar from its avatar CDN by numeric user id,
 * so the signed-in user's picture derives from `githubUserId` (provided by
 * Ingestion) without another API call. The CSP allows only this origin for
 * external images (deploy/security-headers.conf).
 */
export const GITHUB_AVATAR_ORIGIN = "https://avatars.githubusercontent.com";

/** GitHub resizes avatars up to this edge length. */
const MAX_AVATAR_SIZE = 460;

/**
 * Avatar URL for a GitHub user id at `size` pixels (request twice the CSS size
 * for sharp rendering on high-density screens), or `null` when the id is not
 * a GitHub numeric id.
 */
export function githubAvatarUrl(githubUserId: string, size: number): string | null {
  if (!/^[1-9][0-9]*$/.test(githubUserId)) return null;
  const edge = Math.min(MAX_AVATAR_SIZE, Math.max(1, Math.round(size)));
  return `${GITHUB_AVATAR_ORIGIN}/u/${githubUserId}?s=${edge}&v=4`;
}
