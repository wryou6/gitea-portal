import { useState, type CSSProperties } from "react";
import { userAvatarUrl, type UserProfile } from "../../lib/user-profiles";

export function UserAvatar({
  user,
  size = 24,
}: {
  user: UserProfile;
  size?: 16 | 24 | 32;
}) {
  const avatarUrl = userAvatarUrl(user.avatarUrl);
  const [failedUrl, setFailedUrl] = useState<string>();

  return (
    <span
      className="user-avatar"
      style={{ "--user-avatar-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      {avatarUrl && failedUrl !== avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(avatarUrl)}
        />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </svg>
      )}
    </span>
  );
}
