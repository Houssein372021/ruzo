import { useEffect } from "react";

type AdminConfirmDialogProps = {
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminConfirmDialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: AdminConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="admin-confirm-overlay" role="presentation" onMouseDown={onCancel}>
      <div
        aria-modal="true"
        className="admin-confirm-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="admin-confirm-title">{title}</h2>
        <p className="admin-confirm-body">{body}</p>
        <div className="admin-confirm-actions">
          <button type="button" className="admin-confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="admin-confirm-delete" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
