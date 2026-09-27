import { Badge } from "../../components/ui/Badge";
import { useTranslation } from "react-i18next";
export function LabelList({
  labels,
}: {
  labels: Array<{ name: string; color?: string }>;
}) {
  const { t } = useTranslation("issues");
  return (
    <div className="labels" aria-label={t("labels")}>
      {labels.map((label) => (
        <Badge
          key={label.name}
          style={label.color ? { borderColor: `#${label.color}` } : undefined}
        >
          {label.name}
        </Badge>
      ))}
    </div>
  );
}
