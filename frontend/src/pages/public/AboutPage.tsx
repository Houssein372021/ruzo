import heroImage from "../../assets/hero.png";
import { Seo } from "../../components/common/Seo";
import { useI18n } from "../../hooks/useI18n";

export function AboutPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo
        title="About RÜZO | Women's Activewear"
        description="Learn about RÜZO, the rüzo activewear brand built around sculpted support, movement, and soft confidence."
        path="/about"
      />
      <section className="grid min-h-[72vh] lg:grid-cols-2">
        <img src={heroImage} alt={t("aboutImageAlt")} className="h-full min-h-[420px] w-full object-cover" />
        <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b725f]">{t("aboutEyebrow")}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{t("brandStory")}</h1>
            <p className="mt-6 text-sm leading-8 text-[#6d6258]">
              {t("aboutCopy")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
