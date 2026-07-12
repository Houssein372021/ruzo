import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function AdminStatCard({ label, value, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="border border-[#ded2c5] bg-[#fbf7f1] p-5">
      <Icon className="hidden" aria-hidden="true" />
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#8b725f]">{label}</p>
      <p className="mt-3 text-2xl text-[#111111]">{value}</p>
    </div>
  );
}
