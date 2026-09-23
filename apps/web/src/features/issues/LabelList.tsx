import { Badge } from "../../components/ui/Badge";
export function LabelList({
  labels,
}: {
  labels: Array<{ name: string; color?: string }>;
}) {
  return (
    <div className="labels" aria-label="Labels">
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
