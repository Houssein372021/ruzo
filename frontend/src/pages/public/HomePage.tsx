import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ban, CreditCard, Headphones, Package } from "lucide-react";
import { categoriesApi } from "../../api/categories";
import { productsApi } from "../../api/products";
import { Seo } from "../../components/common/Seo";
import { ProductSkeletonGrid } from "../../components/common/Skeleton";
import { ProductCard } from "../../components/product/ProductCard";
import { useI18n } from "../../hooks/useI18n";
import type { Category, Product } from "../../types";
// import { getProductImage } from "../../utils/product";

const heroVideoMp4Url = "/hero-ruzo.mp4";
const heroVideoWebmUrl = "/hero-ruzo.webm";
const heroPosterUrl = "/hero-ruzo-poster.webp";
const editorialImageUrl = "/editorial-ruzo.png";

const categoryFallbacks = [
  { slug: "sets", titleKey: "sets" },
  { slug: "dresses", titleKey: "dresses" },
  { slug: "bottoms", titleKey: "bottoms" },
  { slug: "tops", titleKey: "tops" },
  { slug: "outerwear", titleKey: "outerwear" },
] as const;

const categoryImageFallbacks: Record<string, string> = {
  sets: "/products/ruzo/metallic-magenta-set-01.webp",
  dresses: "/products/ruzo/black-midi-dress-01.webp",
  bottoms: "/products/ruzo/ivory-satin-trouser-set-02.webp",
  tops: "/products/ruzo/black-satin-short-set-02.webp",
  outerwear: "/products/ruzo/sheer-shirt-trouser-set-02.webp",
};

export function HomePage() {
  const { language, dir, t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([productsApi.getAll(), categoriesApi.getAll()])
      .then(([productsData, categoriesData]) => {
        if (isMounted) {
          setProducts(productsData);
          setCategories(categoriesData.filter((category) => category.isActive !== false));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const newArrivals = useMemo(() => {
    const flagged = products.filter((product) => product.isNew);
    return (flagged.length > 0 ? flagged : products).slice(0, 4);
  }, [products]);

  const bestSellers = useMemo(() => {
    const flagged = products.filter((product) => product.isBestSeller);
    return (flagged.length > 0 ? flagged : products.slice(4)).slice(0, 4);
  }, [products]);

  // const heroProductImage = useMemo(() => {
  //   const candidate = bestSellers[0] ?? newArrivals[0] ?? products[0];
  //   return candidate ? getProductImage(candidate) : editorialImageUrl;
  // }, [bestSellers, newArrivals, products]);

  const isRtl = dir === "rtl";

  const copy =
    language === "ar"
      ? {
          discoverCollection: "اكتشفي المجموعة",
          viewAll: "عرض الكل",
          readMore: "اكتشفي المزيد",
          storyLabel: "القصة",
          manifesto:
            "روزو رؤية للملابس الرياضية الفاخرة، تجمع بين خطوط منحوتة، نعومة مدروسة، وحضور يبقى بعد الحركة.",
          storyCopy:
            "كل قطعة مصممة لترافقك من التمرين إلى اليوم الكامل، بخامات مريحة وتفاصيل هادئة تمنح الشكل ثقة دون مبالغة.",
          newInTitle: "وصل حديثا: اختيار روزو",
          journalTitle: "ملاحظات حول الحركة العصرية",
          journalCta: "اقرئي المزيد",
          summerTitle: "Rüzo ss26",
          summerCopy: "طبقات خفيفة، شكل نقي، وحضور يومي.",
          vacationTitle: "خزانة السفر",
          vacationCopy: "قطع مرنة للمدينة، الاستوديو، والوجهات الهادئة.",
          trendingTitle: "الرائج الآن",
          trendingCopy: "الأكثر طلبا من توقيعات روزو.",
          collectionStoryTitle: "مجموعة الحركة الهادئة",
          collectionStoryCopy:
            "تصاميم مبنية على التوازن: دعم ناعم، خامات مطاطية راقية، وقصات تتحرك معك من دون جهد.",
          detailEyebrow: "الاستدامة",
          detailTitle: "كل تفصيل مهم",
          detailCopy:
            "من القصات إلى التغليف، نركز على الجودة والوضوح وتجربة شراء تشعرين معها بالثقة.",
          productFallback: "منتجات مختارة",
        }
      : {
          discoverCollection: "Discover the collection",
          viewAll: "View all",
          readMore: "Discover more",
          storyLabel: "the story",
          manifesto:
            "Rüzo is a vision of high-end activewear, shaped through sculpted lines, soft support, and a presence that lasts beyond movement.",
          storyCopy:
            "Every piece is built to follow the whole day: from training to travel, with refined comfort and quiet details that hold their shape.",
          newInTitle: "New in: Rüzo edit",
          journalTitle: "Notes on modern movement",
          journalCta: "Read more",
          summerTitle: "Rüzo ss26",
          summerCopy: "Light layers, clean shape, everyday presence.",
          vacationTitle: "Travel wardrobe",
          vacationCopy: "Flexible pieces for the city, studio, and quiet escapes.",
          trendingTitle: "Trending now",
          trendingCopy: "The signatures customers reach for again.",
          collectionStoryTitle: "The quiet movement collection",
          collectionStoryCopy:
            "Designed around balance: soft support, premium stretch, and cuts that move without asking for attention.",
          detailEyebrow: "Sustainability",
          detailTitle: "Every detail matters",
          detailCopy:
            "From fit to packaging, Rüzo focuses on quality, clarity, and a shopping experience made to feel considered.",
          productFallback: "Selected pieces",
        };

  const categoryCards = categoryFallbacks.map((fallback) => {
    const category = categories.find((item) => item.slug === fallback.slug);
    return {
      slug: category?.slug ?? fallback.slug,
      title: category ? (language === "ar" ? category.nameAr : category.nameEn) : t(fallback.titleKey),
      image: category?.imageUrl ?? categoryImageFallbacks[fallback.slug] ?? null,
    };
  });

  const servicePromises = [
    {
      icon: Package,
      title: t("freeShippingTitle"),
      copy: t("freeShippingCopy"),
    },
    {
      icon: Headphones,
      title: t("onlineSupportTitle"),
      copy: t("onlineSupportCopy"),
    },
    {
      icon: CreditCard,
      title: t("cashOnDelivery"),
      copy: t("cashOnDeliveryCopy"),
    },
    {
      icon: Ban,
      title: t("finalSaleTitle"),
      copy: t("finalSaleCopy"),
    },
  ];

  return (
    <div className="bg-[#FFFFFF]">
      <Seo
        title="RÜZO | High-end activewear"
        description="Shop RÜZO activewear at rüzo: sets, dresses, bottoms, tops, outerwear, and everyday activewear for women."
        path="/"
        image="/editorial-ruzo.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.rüzo.com/#organization",
              name: "RÜZO",
              alternateName: ["Rüzo", "rüzo"],
              url: "https://www.rüzo.com/",
              logo: "https://www.rüzo.com/site-icon-512.png",
              sameAs: ["https://www.instagram.com/ruzoofficial/"],
            },
            {
              "@type": "WebSite",
              "@id": "https://www.rüzo.com/#website",
              name: "RÜZO",
              alternateName: ["Rüzo", "rüzo"],
              url: "https://www.rüzo.com/",
              publisher: {
                "@id": "https://www.rüzo.com/#organization",
              },
            },
            {
              "@type": "ClothingStore",
              "@id": "https://www.rüzo.com/#store",
              name: "RÜZO",
              url: "https://www.rüzo.com/",
              image: "https://www.rüzo.com/editorial-ruzo.png",
              priceRange: "$$",
            },
          ],
        }}
      />

      <section className="relative min-h-[calc(100vh-104px)] overflow-hidden bg-[#080808]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={heroPosterUrl}
          aria-label={t("heroVideoLabel")}
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src={heroVideoMp4Url} type="video/mp4" />
          <source src={heroVideoWebmUrl} type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-[#080808]/34" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgba(8,8,8,0.82),rgba(107,15,26,0.2),rgba(8,8,8,0))]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-[1500px] items-end justify-center px-5 pb-12 text-center sm:pb-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl text-[#FFFFFF]"
          >
            <h1 className="font-display text-[4.4rem] leading-[0.88] text-balance sm:text-[7rem] lg:text-[8.5rem]">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-7 text-[#FFFFFF]/86 sm:text-base">
              {t("heroCopy")}
            </p>
            <Link
              to="/collections/sets"
              className="mt-8 inline-flex min-h-12 items-center justify-center border border-[#FFFFFF]/85 px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF] transition hover:border-[#6B0F1A] hover:bg-[#6B0F1A]"
            >
              {copy.discoverCollection}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] border-b border-[#080808]/10 px-5 py-16 text-center sm:py-24 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-display text-4xl leading-tight text-[#080808] sm:text-6xl"
        >
          {copy.manifesto}
        </motion.h2>
      </section>

      <section className="grid border-y border-[#080808]/10 bg-[#FFFFFF] lg:grid-cols-2">
        <div className="relative min-h-[520px] overflow-hidden bg-[#080808]">
          <img src={editorialImageUrl} alt="" className="product-image h-full w-full object-cover" />
        </div>
        <div className="flex items-center px-5 py-16 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B0F1A]">
              {copy.storyLabel}
            </p>
            <h2 className="font-display mt-5 text-5xl leading-tight text-[#080808] sm:text-6xl">
              {t("brandStory")}
            </h2>
            <p className="mt-6 text-sm leading-8 text-[#080808]/68 sm:text-base">
              {copy.storyCopy}
            </p>
            <Link
              to="/about"
              className="luxury-link-underline mt-8 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]"
            >
              {copy.readMore}
              <ArrowRight className={isRtl ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B0F1A]">
              {t("newArrivals")}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[#080808] sm:text-4xl">
              {copy.newInTitle}
            </h2>
          </div>
          <Link
            to="/collections/sets"
            className="luxury-link-underline shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]"
          >
            {copy.viewAll}
          </Link>
        </div>

        <div className="mt-9">
          {isLoading ? (
            <ProductSkeletonGrid />
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="border border-[#080808]/10 px-5 py-10 text-center text-sm text-[#080808]/66">
              {t("noProducts")}
            </p>
          )}
        </div>
      </section>

      <section className="border-y border-[#080808]/10 bg-[#FFFFFF] px-5 py-16 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl leading-tight text-[#080808] sm:text-5xl">
              {t("collectionsTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#080808]/68">
              {t("collectionsCopy")}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categoryCards.map((category) => (
              <Link
                key={category.slug}
                to={`/collections/${category.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-[#080808]"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    className="product-image absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#FFFFFF_0%,#FFFFFF_34%,#6B0F1A_35%,#080808_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.78),rgba(107,15,26,0.22),rgba(8,8,8,0.02))]" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFFFFF] sm:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFFFFF]/78">
                    {t("ruzoEdit")}
                  </p>
                  <h3 className="font-display mt-2 text-3xl leading-tight sm:text-4xl lg:text-3xl xl:text-4xl">
                    {category.title}
                  </h3>
                  <span className="mt-5 inline-flex min-h-9 items-center gap-3 border border-[#FFFFFF]/78 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFFFFF] transition group-hover:border-[#6B0F1A] group-hover:bg-[#6B0F1A]">
                    {t("shopNow")}
                    <ArrowRight className={isRtl ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B0F1A]">
              {copy.trendingTitle}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[#080808] sm:text-4xl">
              {t("bestSellers")}
            </h2>
          </div>
          <Link
            to="/collections/bottoms"
            className="luxury-link-underline shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]"
          >
            {copy.viewAll}
          </Link>
        </div>

        <div className="mt-9">
          {isLoading ? (
            <ProductSkeletonGrid />
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="border border-[#080808]/10 px-5 py-10 text-center text-sm text-[#080808]/66">
              {t("noProducts")}
            </p>
          )}
        </div>
      </section>

      {/* <section className="grid border-y border-[#080808] bg-[#080808] text-[#FFFFFF] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative min-h-[560px] overflow-hidden bg-[#080808]">
          <img
            src={heroProductImage}
            alt=""
            loading="lazy"
            className="product-image h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center px-5 py-16 sm:px-10 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/68">
              {t("ruzoEdit")}
            </p>
            <h2 className="font-display mt-5 text-5xl leading-tight sm:text-6xl">
              {copy.collectionStoryTitle}
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-8 text-[#FFFFFF]/76 sm:text-base">
              {copy.collectionStoryCopy}
            </p>
            <Link
              to="/collections/sets"
              className="mt-8 inline-flex min-h-12 items-center justify-center border border-[#FFFFFF]/75 px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF] transition hover:border-[#6B0F1A] hover:bg-[#6B0F1A]"
            >
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </section> */}

      <section className="bg-[#FFFFFF]">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B0F1A]">
              {copy.detailEyebrow}
            </p>
            <h2 className="font-display mt-3 text-5xl leading-tight text-[#080808]">
              {copy.detailTitle}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-8 text-[#080808]/68">
              {copy.detailCopy}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {servicePromises.map((promise) => {
              const Icon = promise.icon;

              return (
                <div key={promise.title} className="border-t border-[#080808]/10 pt-5">
                  <Icon className="h-8 w-8 stroke-[1.6] text-[#6B0F1A]" />
                  <h3 className="mt-5 text-sm font-semibold uppercase leading-6 tracking-[0.16em] text-[#080808]">
                    {promise.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#080808]/68">{promise.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
