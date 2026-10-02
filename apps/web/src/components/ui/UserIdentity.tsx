import { useId, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  userAvatarUrl,
  userDisplayName,
  type UserProfile,
} from "../../lib/user-profiles";

export function UserIdentity({
  user,
  size = 24,
  focusable = true,
}: {
  user: UserProfile;
  size?: 24 | 32;
  focusable?: boolean;
}) {
  const { t } = useTranslation("common");
  const tooltipId = useId();
  const name = userDisplayName(user);
  const avatarUrl = userAvatarUrl(user.avatarUrl);
  const [failedUrl, setFailedUrl] = useState<string>();
  const [tooltip, setTooltip] = useState<CSSProperties>();
  const description = t("userIdentity", { name, login: user.login });

  function showTooltip(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    setTooltip({
      width,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 88)),
    });
  }

  return (
    <span
      className="user-identity"
      style={{ "--user-avatar-size": `${size}px` } as CSSProperties}
      tabIndex={focusable ? 0 : undefined}
      role={focusable ? "group" : undefined}
      aria-label={focusable ? description : undefined}
      aria-describedby={tooltip ? tooltipId : undefined}
      onFocus={(event) => showTooltip(event.currentTarget)}
      onBlur={() => setTooltip(undefined)}
      onMouseEnter={(event) => showTooltip(event.currentTarget)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement))
          setTooltip(undefined);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setTooltip(undefined);
      }}
    >
      <span className="user-avatar" aria-hidden="true">
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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>
        )}
      </span>
      <span className="user-identity-name">{name}</span>
      {tooltip &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            className="user-identity-tooltip"
            style={tooltip}
          >
            {description}
          </span>,
          document.body,
        )}
    </span>
  );
}
