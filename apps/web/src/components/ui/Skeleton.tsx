import { useTranslation } from "react-i18next";

export function Skeleton({ className = "" }: { className?: string }) {
  const { t } = useTranslation("common");
  return (
    <div className={`loading ${className}`} aria-hidden="true">
      {t("loading")}
    </div>
  );
}
