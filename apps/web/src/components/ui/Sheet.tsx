import { useEffect, useId, useRef, type ReactNode } from "react";

export function Sheet({
  open,
  title,
  children,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={() => onOpenChange(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "color-mix(in oklch, black 45%, transparent)",
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="detail-card"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: "absolute",
          insetBlock: 0,
          insetInlineEnd: 0,
          width: "min(28rem, 100%)",
          overflowY: "auto",
          borderRadius: 0,
        }}
      >
        <div className="page-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className="secondary"
            onClick={() => onOpenChange(false)}
          >
            關閉
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
