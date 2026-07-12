import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Seo } from "../../components/common/Seo";
import { useI18n } from "../../hooks/useI18n";

export function ConfirmationPage() {
  const [params] = useSearchParams();
  const routeParams = useParams();
  const { t } = useI18n();
  const orderNumber = routeParams.orderNumber ?? params.get("order") ?? t("orderReceived");

  return (
    <>
      <Seo
        title="Order confirmed | Rüzo"
        description="Your Rüzo order has been confirmed."
        robots="noindex,nofollow"
      />
      <section className="grid min-h-[70vh] place-items-center px-4 text-center">
        <div className="max-w-xl">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#4B2E24]" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#8b725f]">Rüzo</p>
          <h1 className="mt-3 text-4xl font-semibold">{t("confirmation")}</h1>
          <p className="mt-4 text-sm text-[#6d6258]">
            {t("orderNumber")}: <span className="font-semibold text-[#111111]">{orderNumber}</span>
          </p>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-[#6d6258]">
            {t("confirmationEmailCopy")}
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex bg-[#4B2E24] px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#F8F4EC] transition hover:bg-[#3a2118]"
          >
            {t("backHome")}
          </Link>
        </div>
      </section>
    </>
  );
}
