import { useTranslation } from "react-i18next";

export function PermissionDenied() {
  const { t } = useTranslation("feedback");
  return (
    <div className="permission" role="alert">
      <strong>{t("permissionDenied")}</strong>
      <div>{t("permissionDeniedDescription")}</div>
    </div>
  );
}
