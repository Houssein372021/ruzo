import type { SVGProps } from "react";
import { Link } from "react-router-dom";
import { InstagramIcon } from "../common/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";

const TIKTOK_URL = "https://www.tiktok.com/@ruzobeirut";
const TIKTOK_HANDLE = "@ruzobeirut";

function TikTokIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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

export function Footer() {
  const { t } = useI18n();
  const menuLinks = [
    { to: "/about", label: t("about") },
    { to: "/contact", label: t("contact") },
  ];

  return (
    <footer className="font-display border-t border-[#E5E5E5] bg-[#F7F7F7] text-[#080808]">
      <section className="border-t border-[#E5E5E5] bg-[#F7F7F7] text-[#080808]">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-x-8 gap-y-12 px-5 py-14 lg:grid-cols-[1.15fr_0.65fr_0.95fr_0.7fr] lg:px-8">
          <div className="col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="font-display text-[2rem] uppercase leading-none tracking-[0.12em] text-[#080808]"
            >
              RÜZO
            </Link>
            <p className="font-display mt-6 max-w-xs text-[1.2rem] leading-7 text-[#080808]/68">
              {t("footerCopy")}
            </p>
          </div>

          <div>
            <h3 className="text-[1.2rem] font-normal tracking-[0.04em] text-[#080808]/72">
              {t("menu")}
            </h3>
            <div className="mt-5 grid gap-3 text-[1.2rem] text-[#080808]">
              {menuLinks.map((link) => (
                <Link key={link.label} to={link.to} className="luxury-link-underline w-fit">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[1.2rem] font-normal tracking-[0.04em] text-[#080808]/72">
              {t("reachUs")}
            </h3>
            <div className="mt-5 grid gap-4 text-[1.2rem] text-[#080808]">
              <div>
                <p className="font-display text-base font-normal tracking-[0.04em] text-[#080808]/55">
                  Email
                </p>
                <a href="mailto:contact@rüzo.com" className="luxury-link-underline mt-1 inline-flex w-fit">
                  contact@rüzo.com
                </a>
              </div>
              <div>
                <p className="font-display text-base font-normal tracking-[0.04em] text-[#080808]/55">
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

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-[1.2rem] font-normal tracking-[0.04em] text-[#080808]/72">
              {t("social")}
            </h3>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[1.2rem] text-[#080808] lg:grid lg:gap-3">
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

        <div className="border-t border-[#E5E5E5]">
          <div className="mx-auto flex max-w-[1500px] px-5 py-5 text-base tracking-[0.04em] text-[#080808]/62 lg:px-8">
            <span>{t("footerTagline")}</span>
          </div>
        </div>
      </section>
    </footer>
  );
}
