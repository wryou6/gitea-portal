import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ISSUE_PRIORITIES, ISSUE_TYPES } from "@gitea-portal/domain";
import { useTranslation } from "react-i18next";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { toUserFacingError, type UserFacingError } from "../../lib/api";

type MetadataField = "priority" | "type";

type Choice = {
  value: string;
  label: string;
  className: string;
};

export function IssueMetadataBadgeEditor({
  field,
  value,
  children,
  onSave,
}: {
  field: MetadataField;
  value: string | null;
  children: ReactNode;
  onSave: (value: string) => Promise<void>;
}) {
  const { t } = useTranslation("issues");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [saving, setSaving] = useState(false);
  const [pendingValue, setPendingValue] = useState<string>();
  const [error, setError] = useState<UserFacingError>();
  const fieldLabel = t(field === "priority" ? "priorityLabel" : "type");
  const choices: Choice[] = field === "priority"
    ? ISSUE_PRIORITIES.map((priority) => ({
        value: priority,
        label: t(`priority${priority[0]!.toUpperCase()}${priority.slice(1)}`),
        className: `priority-badge priority-badge--${priority}`,
      }))
    : ISSUE_TYPES.map((type) => ({
        value: type,
        label: t(`type${type[0]!.toUpperCase()}${type.slice(1)}`),
        className: `issue-type-badge issue-type-badge--${type}`,
      }));

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = popoverRef.current?.offsetWidth ?? 240;
    const height = popoverRef.current?.offsetHeight ?? 280;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const below = rect.bottom + 4;
    const top = below + height <= window.innerHeight - 8
      ? below
      : Math.max(8, rect.top - height - 4);
    setPosition({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    const closeWhenOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !detailsRef.current?.contains(event.target) &&
        !popoverRef.current?.contains(event.target)
      ) {
        if (detailsRef.current) detailsRef.current.open = false;
        setOpen(false);
      }
    };
    updatePosition();
    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const close = (returnFocus: boolean) => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
    setError(undefined);
    setPendingValue(undefined);
    if (returnFocus) triggerRef.current?.focus();
  };

  const save = async (nextValue: string) => {
    if (saving) return;
    setPendingValue(nextValue);
    setError(undefined);
    setSaving(true);
    try {
      await onSave(nextValue);
      close(false);
    } catch (cause) {
      setError(toUserFacingError(cause, t("issueMetadataSaveFailed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <details
      ref={detailsRef}
      className="issue-metadata-editor"
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
        if (event.currentTarget.open) updatePosition();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          close(true);
        }
      }}
    >
      <summary
        ref={triggerRef}
        className="issue-metadata-editor-trigger"
        aria-label={t("editIssueMetadata", {
          field: fieldLabel,
          value: choices.find((choice) => choice.value === value)?.label ?? t("notSet"),
        })}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </summary>
      {open && createPortal(<div ref={popoverRef} className="issue-metadata-editor-popover" style={{ top: position.top, left: position.left }}>
        <span className="issue-metadata-editor-label">{t("chooseIssueMetadata", { field: fieldLabel })}</span>
        <div className="issue-metadata-editor-options" role="group" aria-label={t("chooseIssueMetadata", { field: fieldLabel })}>
          {choices.map((choice) => (
            <button
              key={choice.value}
              type="button"
              className="issue-metadata-editor-option"
              aria-pressed={value === choice.value}
              disabled={saving}
              onClick={() => void save(choice.value)}
              onDragStart={(event) => event.preventDefault()}
            >
              <span className={`label ${choice.className}`}>{choice.label}</span>
            </button>
          ))}
        </div>
        {saving && <span className="issue-metadata-editor-status" role="status" aria-live="polite">{t("savingIssueMetadata")}</span>}
        {error && (
          <div className="issue-metadata-editor-error">
            <ErrorNotice message={error} />
            {pendingValue && (
              <button type="button" className="issue-metadata-editor-retry" onClick={() => void save(pendingValue)}>
                {t("retryIssueMetadata")}
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          className="issue-metadata-editor-cancel"
          disabled={saving}
          onClick={() => close(true)}
        >
          {t("cancelIssueMetadata")}
        </button>
      </div>, document.body)}
    </details>
  );
}
