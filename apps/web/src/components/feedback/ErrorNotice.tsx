import { useTranslation } from "react-i18next";
import { PortalApiError } from "../../lib/api";

export function ErrorNotice({ message }: { message: string | PortalApiError }) {
  const { t } = useTranslation("api-errors");
  const summary =
    message instanceof PortalApiError
      ? t(message.code, message.params)
      : message;
  return (
    <div className="error" role="alert">
      <p>{summary}</p>
      {message instanceof PortalApiError &&
        (message.message || message.detail) && (
        <details>
          <summary>{t("detail")}</summary>
          <pre>{[message.message, message.detail].filter(Boolean).join("\n\n")}</pre>
        </details>
      )}
    </div>
  );
}
