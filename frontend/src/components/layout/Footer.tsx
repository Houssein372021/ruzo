import { Link } from "react-router-dom";
// import { Gem, Leaf, Mail, Truck } from "lucide-react";
import { Gem, Leaf, Truck } from "lucide-react";
import { InstagramIcon } from "../common/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";

export function Footer() {
  const { t } = useI18n();

  const footerColumns = [
    {
      title: t("menu"),
      links: [
        { to: "/about", label: t("about") },
        { to: "/contact", label: t("contact") },
        { to: "/favorites", label: t("favorites") },
      ],
    },
    {
      title: t("usefulLinks"),
      links: [
        { to: "/about", label: t("brandJournal") },
        { to: "/contact", label: t("storeLocator") },
        { to: "/contact", label: t("shippingReturns") },
      ],
    },
    {
      title: t("shop"),
      links: [
        { to: "/collections/sets", label: t("sets") },
        { to: "/collections/dresses", label: t("dresses") },
        { to: "/collections/bottoms", label: t("bottoms") },
        { to: "/collections/tops", label: t("tops") },
        { to: "/collections/outerwear", label: t("outerwear") },
      ],
    },
  ];

  const serviceItems = [
    {
      icon: Truck,
      title: t("worldwideShipping"),
      copy: t("worldwideShippingCopy"),
    },
    {
      icon: Gem,
      title: t("premiumMaterials"),
      copy: t("premiumMaterialsCopy"),
    },
    {
      icon: Leaf,
      title: t("consideredDetails"),
      copy: t("consideredDetailsCopy"),
    },
  ];

  return (
    <footer className="border-t border-[#FFFFFF]/12 bg-[#080808] text-[#FFFFFF]">
      {/* <section className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">RÜZO</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#FFFFFF]/72">
            {t("footerLocation")}
            <br />
            {t("footerHours")}
          </p>
          <Link
            to="/contact"
            className="luxury-link-underline mt-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]"
          >
            {t("getDirection")}
          </Link>
        </div>

        <div className="border-t border-[#FFFFFF]/14 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/68">
            {t("newsletter")}
          </p>
          <h3 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">
            {t("footerNewsletterHeading")}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#FFFFFF]/72">{t("newsletterCopy")}</p>
          <form
            className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="sr-only" htmlFor="footer-email">
              {t("emailPlaceholder")}
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              className="min-h-12 flex-1 border border-[#FFFFFF]/24 bg-[#FFFFFF] px-4 text-sm text-[#080808] outline-none transition placeholder:text-[#080808]/45 focus:border-[#6B0F1A] focus:shadow-[0_0_0_3px_rgba(107,15,26,0.22)]"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#FFFFFF] bg-[#FFFFFF] px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808] transition hover:bg-[#6B0F1A] hover:text-[#FFFFFF]"
            >
              <Mail className="h-4 w-4" />
              {t("subscribe")}
            </button>
          </form>
        </div>
      </section> */}

      <section className="border-t border-[#FFFFFF]/12 bg-[#6B0F1A] text-[#FFFFFF]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-14 lg:grid-cols-[1.15fr_1.6fr_0.75fr] lg:px-8">
          <div>
            <Link
              to="/"
              className="font-display text-[2rem] uppercase leading-none tracking-[0.36em] text-white"
            >
              RÜZO
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-[#FFFFFF]/72">
              {t("footerCopy")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-9 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/70">
                  {column.title}
                </h3>
                <div className="mt-5 grid gap-3 text-sm text-[#FFFFFF]">
                  {column.links.map((link) => (
                    <Link key={`${column.title}-${link.label}`} to={link.to} className="luxury-link-underline w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/70">
              {t("reachUs")}
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-[#FFFFFF]">
              <a href="mailto:contact@rüzo.com" className="luxury-link-underline w-fit">
                contact@rüzo.com
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`${t("instagram")} ${INSTAGRAM_HANDLE}`}
                className="luxury-link-underline inline-flex w-fit items-center gap-2"
              >
                <InstagramIcon className="h-4 w-4" />
                {INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFFFFF]/12">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-5 text-[11px] uppercase tracking-[0.18em] text-[#FFFFFF]/62 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <span>{t("footerTagline")}</span>
            <span>{t("legalLinks")}</span>
          </div>
        </div>
      </section>

      <section className="grid border-t border-[#FFFFFF]/12 bg-[#080808] text-[#FFFFFF] lg:grid-cols-3">
        {serviceItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-4 border-b border-[#FFFFFF]/12 px-5 py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-8"
            >
              <Icon className="h-8 w-8 stroke-[1.5] text-[#6B0F1A]" />
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">{item.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#FFFFFF]/64">{item.copy}</p>
              </div>
            </div>
          );
        })}
      </section>
    </footer>
  );
}
