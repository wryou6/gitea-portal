import { useId, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { userDisplayName, type UserProfile } from "../../lib/user-profiles";
import { UserAvatar } from "./UserAvatar";

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
      <UserAvatar user={user} size={size} />
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
