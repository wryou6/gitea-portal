import type { ReactNode } from "react";
export function EmptyState({
  children = "沒有資料",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="empty" role="status">
      {children}
    </div>
  );
}
