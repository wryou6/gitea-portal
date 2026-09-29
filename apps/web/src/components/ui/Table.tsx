import { forwardRef, type CSSProperties, type ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  style?: CSSProperties;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children, className, ariaLabel, style },
  ref,
) {
  return (
    <div
      className="table-scroll-region"
      role={ariaLabel ? "region" : undefined}
      tabIndex={ariaLabel ? 0 : undefined}
      aria-label={ariaLabel}
    >
      <table ref={ref} className={className} style={style}>
        {children}
      </table>
    </div>
  );
});
