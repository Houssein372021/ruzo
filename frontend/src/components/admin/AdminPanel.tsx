import type { ReactNode } from "react";

type AdminPanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function AdminPanel({ title, action, children }: AdminPanelProps) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2 className="font-display text-lg text-[#111111]">{title}</h2>
        {action}
      </div>
      <div className="admin-panel-body">{children}</div>
    </section>
  );
}
