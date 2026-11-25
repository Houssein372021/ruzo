import { useEffect } from "react";

type AdminConfirmDialogProps = {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export function AdminConfirmDialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  isPending = false,
}: AdminConfirmDialogProps) {
  useEffect(() => {
    if (isPending) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onCancel]);

  return (
    <div className="admin-confirm-overlay" role="presentation" onMouseDown={isPending ? undefined : onCancel}>
      <div
        aria-modal="true"
        className="admin-confirm-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="admin-confirm-title">{title}</h2>
        <p className="admin-confirm-body wrap-anywhere">{body}</p>
        <div className="admin-confirm-actions">
          <button type="button" className="admin-confirm-cancel disabled:opacity-50" disabled={isPending} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="admin-confirm-delete disabled:opacity-50" disabled={isPending} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
