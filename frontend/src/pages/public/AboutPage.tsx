import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoriesApi } from "../../api/categories";
import { Seo } from "../../components/common/Seo";
import { INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";
import type { Category } from "../../types";

const heroImage = "/products/ruzo/black-midi-dress-01.webp";
const secondaryImage = "/products/ruzo/metallic-magenta-set-01.webp";
const detailImage = "/products/ruzo/sheer-shirt-trouser-set-02.webp";

export function AboutPage() {
  const { language, dir } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const isRtl = dir === "rtl";

  useEffect(() => {
    let isMounted = true;

    categoriesApi.getAll().then((data) => {
      if (isMounted) {
        setCategories(data.filter((category) => category.isActive !== false));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryCollectionPath = categories[0] ? `/collections/${categories[0].slug}` : "/";

  const copy =
    language === "ar"
      ? {
          eyebrow: "عن RÜZO",
          title: "أزياء نسائية من بيروت، مصممة لحضور يومي أنيق.",
          intro:
            "RÜZO علامة أزياء نسائية تجمع بين أطقم الساتان، الفساتين الانسيابية، القطع العلوية، القطع السفلية، والطبقات الخارجية بإحساس عصري سهل التنسيق.",
          lead:
            "نصمم قطعاً تبدو جاهزة من دون مبالغة: لمعان ناعم، خطوط نظيفة، وقصات تنتقل بسهولة من النهار إلى المساء.",
          shop: "تسوقي المجموعة",
          instagram: "تابعينا على إنستغرام",
          valuesTitle: "ما نؤمن به",
          values: [
            {
              title: "حضور واضح",
              copy: "قطع مصممة لتبرز الإطلالة من دون أن تطغى عليها.",
            },
            {
              title: "سهولة التنسيق",
              copy: "ألوان وقصات يمكن مزجها بين الأطقم، الفساتين، والطبقات.",
            },
            {
              title: "تفاصيل مدروسة",
              copy: "ملمس ناعم، لمعان متوازن، ونهايات تعطي القطعة قيمة يومية.",
            },
          ],
          collectionTitle: "مجموعة مبنية حول القطع التي ترتديها فعلاً.",
          collectionCopy:
            "من Bisou Set إلى  Essential Linen Dress Dress والطبقات الشفافة، RÜZO يبني خزانة صغيرة لكنها مؤثرة.",
          categories: "التصنيفات",
        }
      : {
          eyebrow: "About RÜZO",
          title: "Beirut womenswear for polished everyday presence.",
          intro:
            "RÜZO is a womenswear label built around satin sets, fluid dresses, clean tops, tailored bottoms, and outerwear with a modern, wearable finish.",
          lead:
            "The edit is designed to feel ready without trying too hard: soft shine, clean lines, and silhouettes that move from daylight to late plans.",
          shop: "Shop the collection",
          instagram: "Follow on Instagram",
          valuesTitle: "What we stand for",
          values: [
            {
              title: "Quiet impact",
              copy: "Pieces with presence, designed to elevate the outfit without overpowering it.",
            },
            {
              title: "Easy styling",
              copy: "Shapes and colors made to mix across sets, dresses, tops, bottoms, and layers.",
            },
            {
              title: "Considered detail",
              copy: "Soft texture, balanced shine, and finishes that make each piece feel intentional.",
            },
          ],
          collectionTitle: "A wardrobe edit built around the pieces you actually wear.",
          collectionCopy:
            "From the Bisou Set to the Essential Linen Dress and sheer layers, RÜZO keeps the collection focused, expressive, and easy to style.",
          categories: "Categories",
        };

  return (
    <>
      <Seo
        title="About RÜZO | Beirut womenswear"
        description="Learn about RÜZO, a Beirut womenswear label for satin sets, dresses, tops, bottoms, and outerwear."
        path="/about"
        image={heroImage}
      />

      <main className="bg-[#FFFFFF] text-[#080808]">
        <section className="border-b border-[#080808]/10">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div className="relative min-h-[520px] overflow-hidden bg-[#080808] lg:min-h-[680px]">
              <img src={heroImage} alt="" className="product-image h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.42),rgba(8,8,8,0.02))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 text-[#FFFFFF] sm:p-8">
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">RÜZO</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFFFFF]/72">
                  Beirut
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6B0F1A]">
                  {copy.eyebrow}
                </p>
                <h1 className="font-display mt-5 text-5xl leading-[1.05] text-[#080808] sm:text-6xl lg:text-7xl">
                  {copy.title}
                </h1>
                <p className="mt-7 max-w-xl text-base leading-8 text-[#080808]/72">
                  {copy.intro}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-8 text-[#080808]/62">
                  {copy.lead}
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link
                    to={primaryCollectionPath}
                    className="inline-flex min-h-12 items-center justify-center border border-[#6B0F1A] bg-[#6B0F1A] px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFFFFF] transition hover:bg-[#080808] hover:border-[#080808]"
                  >
                    {copy.shop}
                  </Link>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="luxury-link-underline inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#080808]"
                  >
                    {copy.instagram}
                    <ArrowRight className={isRtl ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#080808]/10">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[0.74fr_1.26fr] lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6B0F1A]">
                {copy.valuesTitle}
              </p>
              <h2 className="font-display mt-4 max-w-md text-4xl leading-tight text-[#080808] sm:text-5xl">
                {copy.collectionTitle}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {copy.values.map((value) => (
                <article key={value.title} className="border-t border-[#080808] pt-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#080808]">
                    {value.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#080808]/66">{value.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1500px] gap-px bg-[#080808]/10 lg:grid-cols-3">
          <div className="bg-[#FFFFFF] p-5 sm:p-8 lg:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6B0F1A]">
              {copy.categories}
            </p>
            <p className="mt-5 text-sm leading-8 text-[#080808]/66">{copy.collectionCopy}</p>
            <div className="mt-8 grid gap-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/collections/${category.slug}`}
                  className="flex items-center justify-between border-b border-[#080808]/10 py-3 text-sm font-medium text-[#080808] transition hover:text-[#6B0F1A]"
                >
                  <span>{language === "ar" ? category.nameAr : category.nameEn}</span>
                  <ArrowRight className={isRtl ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
                </Link>
              ))}
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden bg-[#080808] lg:col-span-1">
            <img src={secondaryImage} alt="" loading="lazy" className="product-image h-full w-full object-cover" />
          </div>

          <div className="relative min-h-[420px] overflow-hidden bg-[#080808] lg:col-span-1">
            <img src={detailImage} alt="" loading="lazy" className="product-image h-full w-full object-cover" />
          </div>
        </section>
      </main>
    </>
  );
}
