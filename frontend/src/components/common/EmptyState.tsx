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
    <div className="mx-auto flex min-h-[340px] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b725f]">Rüzo</p>
      <h2 className="mt-4 text-3xl font-semibold text-[#111111]">{title}</h2>
      {copy ? <p className="mt-3 text-sm leading-7 text-[#6d6258]">{copy}</p> : null}
      {actionTo ? (
        <Link
          to={actionTo}
          className="mt-8 inline-flex items-center gap-2 bg-[#4B2E24] px-6 py-3 text-sm font-semibold text-[#F8F4EC] transition hover:bg-[#3a2118]"
        >
          {actionLabel ?? t("continueShopping")}
          <ArrowRight className={dir === "rtl" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
        </Link>
      ) : null}
    </div>
  );
}
