import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

const dialogStack: symbol[] = [];

export function Dialog({
  open,
  title,
  children,
  onClose,
  className,
  headerAction,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  headerAction?: ReactNode;
}) {
  if (!open) return null;
  return (
    <DialogContent title={title} onClose={onClose} className={className} headerAction={headerAction}>
      {children}
    </DialogContent>
  );
}

function DialogContent({
  title,
  children,
  onClose,
  className,
  headerAction,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  headerAction?: ReactNode;
}) {
  const titleId = useId();
  const { t } = useTranslation("common");
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const stackId = useRef(Symbol("dialog"));
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : undefined;
    dialogStack.push(stackId.current);
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== stackId.current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const stackIndex = dialogStack.lastIndexOf(stackId.current);
      if (stackIndex >= 0) dialogStack.splice(stackIndex, 1);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);
  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "grid",
        placeItems: "center",
        background: "color-mix(in oklch, black 45%, transparent)",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`detail-card${className ? ` ${className}` : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="page-heading">
          <h2 id={titleId}>{title}</h2>
          <div className="dialog-header-actions">
            {headerAction}
            <button ref={closeRef} type="button" className="secondary" onClick={onClose}>
              {t("close")}
            </button>
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
