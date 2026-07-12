import { Link } from "react-router-dom";
import { InstagramIcon } from "../common/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#4B2E24] text-[#F8F4EC]">
      <div className="mx-auto grid max-w-300 gap-12 px-5 py-16 md:grid-cols-[1.35fr_1.1fr] lg:px-10 xl:px-0">
        <div className="flex flex-col items-start">
          <Link
            to="/"
            className="text-[30px] font-semibold uppercase leading-none tracking-[0.38em] text-white"
          >
            RÜZO
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={`${t("instagram")} ${INSTAGRAM_HANDLE}`}
            className="mt-8 inline-flex items-center gap-3 border border-[#F8F4EC]/28 px-4 py-3 text-xs font-semibold uppercase tracking-display text-[#F8F4EC] transition hover:border-[#F8F4EC] hover:bg-[#F8F4EC]/10"
          >
            <InstagramIcon className="h-4 w-4" />
            {INSTAGRAM_HANDLE}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-display text-[#D8C3A5]">{t("shop")}</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-white">
              <Link to="/collections/sets" className="luxury-link-underline w-fit">
                {t("sets")}
              </Link>
              <Link to="/collections/sport-bras" className="luxury-link-underline w-fit">
                {t("sportsBras")}
              </Link>
              <Link to="/collections/bottoms" className="luxury-link-underline w-fit">
                {t("bottoms")}
              </Link>
              <Link to="/favorites" className="luxury-link-underline w-fit">
                {t("favorites")}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-display text-[#D8C3A5]">{t("studio")}</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-white">
              <Link to="/about" className="luxury-link-underline w-fit">
                {t("about")}
              </Link>
              <Link to="/contact" className="luxury-link-underline w-fit">
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-[11px] uppercase tracking-display text-[#d8cbbd]/70">
        {t("footerTagline")}
      </div>
    </footer>
  );
}
