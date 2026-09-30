import type { Issue } from "../../lib/api";
import { issueStatusTranslationKey } from "../../i18n/status";
import { useTranslation } from "react-i18next";
import { Badge } from "./Badge";
import { cn } from "../../lib/utils";

export function IssueStatusBadge({
  status,
  className,
}: {
  status: Issue["status"];
  className?: string;
}) {
  const { t } = useTranslation("issues");
  return (
    <Badge className={cn("issue-status", `issue-status--${status}`, className)}>
      {t(issueStatusTranslationKey(status))}
    </Badge>
  );
}
