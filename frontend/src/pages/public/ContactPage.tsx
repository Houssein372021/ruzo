import type { ElementType } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "../../config/brand";
import { InstagramIcon } from "../../components/common/InstagramIcon";
import { Seo } from "../../components/common/Seo";
import { useI18n } from "../../hooks/useI18n";

type ContactItem = {
  icon: ElementType;
  label: string;
  value: string;
  href?: string;
};

export function ContactPage() {
  const { t } = useI18n();
  const contactItems: ContactItem[] = [
    { icon: Mail, label: t("email"), value: "contact@rüzo.com", href: "mailto:contact@rüzo.com" },
    { icon: MessageCircle, label: t("whatsapp"), value: "+33 6 00 00 00 00" },
    { icon: InstagramIcon, label: t("instagram"), value: INSTAGRAM_HANDLE, href: INSTAGRAM_URL },
  ];

  return (
    <>
      <Seo
        title="Contact RÜZO | rüzo"
        description="Contact RÜZO for activewear fit, care, order support, and rüzo customer questions."
        path="/contact"
      />
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-display text-[#8b725f]">{t("contact")}</p>
        <h1 className="font-display mt-5 max-w-4xl text-5xl leading-tight text-[#111111]">
          {t("contactHeading")}
        </h1>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contactItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="h-6 w-6 text-[#4B2E24]" />
                <p className="font-display mt-7 text-xl text-[#111111]">{item.label}</p>
                <p className="mt-3 text-sm text-[#4B2E24]">{item.value}</p>
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="block bg-white p-7 transition hover:-translate-y-1 hover:shadow-sm"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={item.label} className="bg-white p-7">
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
