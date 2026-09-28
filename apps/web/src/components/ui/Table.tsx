import type { ReactNode } from "react";
export function Table({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      className="table-scroll-region"
      role={ariaLabel ? "region" : undefined}
      tabIndex={ariaLabel ? 0 : undefined}
      aria-label={ariaLabel}
    >
      <table className={className}>
        {children}
      </table>
    </div>
  );
}
