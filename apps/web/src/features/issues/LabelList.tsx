import type { CSSProperties } from "react";
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
          data-label-color={label.color ? "true" : undefined}
          style={
            label.color
              ? ({
                  "--gitea-label-color": label.color.startsWith("#")
                    ? label.color
                    : `#${label.color}`,
                } as CSSProperties)
              : undefined
          }
        >
          {label.name}
        </Badge>
      ))}
    </div>
  );
}
