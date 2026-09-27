import { useTranslation } from "react-i18next";

export function LoadingState() {
  const { t } = useTranslation("feedback");
  return (
    <div className="loading" role="status" aria-live="polite">
      {t("loading")}
    </div>
  );
}
