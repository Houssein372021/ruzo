import { Link } from "react-router-dom";
import { InstagramIcon } from "../common/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";

export function Footer() {
  const { t } = useI18n();
  const TIKTOK_URL = "https://www.tiktok.com/@ruzobeirut";
  const TIKTOK_HANDLE = "@ruzobeirut";
  type IconProps = React.SVGProps<SVGSVGElement>;

  function TikTokIcon({ className, ...props }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2-2.75V9.4a6.34 6.34 0 1 0 5.45 6.27V8.73a8.16 8.16 0 0 0 4.77 1.52V6.82c-.34 0-.67-.05-1-.13Z" />
      </svg>
    );
  }
  const menuLinks = [
    { to: "/about", label: t("about") },
    { to: "/contact", label: t("contact") },
  ];

  return (
    <footer className="border-t border-[#FFFFFF]/12 bg-[#080808] text-[#FFFFFF]">
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
            <div className="mt-5 grid gap-4 text-sm text-[#FFFFFF]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFFFFF]/52">
                  Email
                </p>
                <a href="mailto:contact@rüzo.com" className="luxury-link-underline mt-1 inline-flex w-fit">
                  contact@rüzo.com
                </a>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFFFFF]/52">
                  {t("whatsapp")}
                </p>
                <a
                  href="https://wa.me/96178707979"
                  target="_blank"
                  rel="noreferrer"
                  className="luxury-link-underline mt-1 inline-flex w-fit"
                >
                  +961 78 70 79 79
                </a>
              </div>
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

              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`TikTok ${TIKTOK_HANDLE}`}
                className="luxury-link-underline inline-flex w-fit items-center gap-2"
              >
                <TikTokIcon className="h-4 w-4" />
                {TIKTOK_HANDLE}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFFFFF]/12">
          <div className="mx-auto flex max-w-[1500px] px-5 py-5 text-[11px] uppercase tracking-[0.18em] text-[#FFFFFF]/62 lg:px-8">
            <span>{t("footerTagline")}</span>
          </div>
        </div>
      </section>
    </footer>
  );
}
