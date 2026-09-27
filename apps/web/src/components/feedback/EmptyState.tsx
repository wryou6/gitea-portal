import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
export function EmptyState({
  children,
}: {
  children?: ReactNode;
}) {
  const { t } = useTranslation("feedback");
  return (
    <div className="empty" role="status">
      {children ?? t("empty")}
    </div>
  );
}
