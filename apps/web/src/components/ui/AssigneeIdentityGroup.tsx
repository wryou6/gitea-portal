import { useTranslation } from "react-i18next";
import {
  userDisplayName,
  type UserProfile,
} from "../../lib/user-profiles";
import { UserAvatar } from "./UserAvatar";
import { UserIdentity } from "./UserIdentity";

const MAX_EXTRA_AVATARS = 2;

export function AssigneeIdentityGroup({
  users,
  emptyLabel,
}: {
  users: UserProfile[];
  emptyLabel: string;
}) {
  const { t } = useTranslation("common");

  if (users.length === 0) return <>{emptyLabel}</>;
  if (users.length === 1) return <UserIdentity user={users[0]!} />;

  const primary = users[0]!;
  const visibleOthers = users.slice(1, MAX_EXTRA_AVATARS + 1);
  const hiddenCount = users.length - 1 - visibleOthers.length;
  const people = users
    .map((user) => {
      const name = userDisplayName(user);
      return name === user.login ? name : `${name} (${user.login})`;
    })
    .join(", ");
  const accessibleName = t("assigneeGroup", { people });

  return (
    <span
      className="assignee-identity-group"
      role="group"
      tabIndex={0}
      aria-label={accessibleName}
      title={accessibleName}
    >
      <span className="assignee-identity-primary">
        <UserAvatar user={primary} />
        <span className="user-identity-name">{userDisplayName(primary)}</span>
      </span>
      {visibleOthers.map((user) => (
        <span className="assignee-extra-avatar" key={user.login}>
          <UserAvatar user={user} size={16} />
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="assignee-overflow" aria-hidden="true">
          +{hiddenCount}
        </span>
      )}
    </span>
  );
}
