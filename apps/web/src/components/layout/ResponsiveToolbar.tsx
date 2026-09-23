import type { ReactNode } from "react";
export function ResponsiveToolbar({ children }: { children: ReactNode }) {
  return <div className="filters">{children}</div>;
}
