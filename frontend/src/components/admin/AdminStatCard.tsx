import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function AdminStatCard({ label, value, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="border border-[#080808]/10 bg-[#FFFFFF] p-5">
      <Icon className="hidden" aria-hidden="true" />
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#6B0F1A]">{label}</p>
      <p className="mt-3 text-2xl text-[#080808]">{value}</p>
    </div>
  );
}
