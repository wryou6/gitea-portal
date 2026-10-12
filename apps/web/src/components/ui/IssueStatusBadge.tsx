import type { Issue } from "../../lib/api";
import { issueStatusTranslationKey } from "../../i18n/status";
import { useTranslation } from "react-i18next";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";

export function IssueStatusBadge({
  status,
  className,
  onClick,
  disabled = false,
}: {
  status: Issue["status"];
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation("issues");
  const badge = <Badge className={cn("issue-status", `issue-status--${status}`, className)}>{t(issueStatusTranslationKey(status))}</Badge>;
  if (!onClick) return badge;
  return <button type="button" className="issue-status-badge-trigger" onClick={onClick} disabled={disabled}>{badge}</button>;
}
