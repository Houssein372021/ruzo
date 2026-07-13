import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

type EmptyStateProps = {
  title: string;
  copy?: string;
  actionTo?: string;
  actionLabel?: string;
};

export function EmptyState({ title, copy, actionTo, actionLabel }: EmptyStateProps) {
  const { dir, t } = useI18n();

  return (
    <div className="mx-auto flex min-h-[340px] max-w-xl flex-col items-center justify-center border border-[#080808]/10 bg-[#FFFFFF] px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6B0F1A]">RÜZO</p>
      <h2 className="mt-4 text-3xl font-semibold text-[#080808]">{title}</h2>
      {copy ? <p className="mt-3 text-sm leading-7 text-[#080808]/66">{copy}</p> : null}
      {actionTo ? (
        <Link
          to={actionTo}
          className="mt-8 inline-flex items-center gap-2 bg-[#6B0F1A] px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition hover:bg-[#080808]"
        >
          {actionLabel ?? t("continueShopping")}
          <ArrowRight className={dir === "rtl" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
        </Link>
      ) : null}
    </div>
  );
}
