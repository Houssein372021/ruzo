import { Link } from "react-router-dom";
// import { Gem, Leaf, Mail, Truck } from "lucide-react";
// import { Gem, Leaf, Truck } from "lucide-react";
import { InstagramIcon } from "../common/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";

export function Footer() {
  const { t } = useI18n();

  const menuLinks = [
    { to: "/about", label: t("about") },
    { to: "/contact", label: t("contact") },
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
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.65fr_0.95fr_0.7fr] lg:px-8">
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

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/70">
              {t("menu")}
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-[#FFFFFF]">
              {menuLinks.map((link) => (
                <Link key={link.label} to={link.to} className="luxury-link-underline w-fit">
                  {link.label}
                </Link>
              ))}
            </div>
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
                href="https://wa.me/96178707979"
                target="_blank"
                rel="noreferrer"
                className="luxury-link-underline w-fit"
              >
                +961 78 70 79 79 ({t("whatsapp")})
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/70">
              {t("social")}
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-[#FFFFFF]">
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


    </footer>
  );
}
