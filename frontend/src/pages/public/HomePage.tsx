import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ban, ChevronLeft, ChevronRight, CreditCard, Headphones, Leaf, Package, Shirt, Truck } from "lucide-react";
import { homepageApi } from "../../api/homepage";
import { productsApi } from "../../api/products";
import { Seo } from "../../components/common/Seo";
import { ProductSkeletonGrid } from "../../components/common/Skeleton";
import { ProductCard } from "../../components/product/ProductCard";
import { INSTAGRAM_URL } from "../../config/brand";
import { useI18n } from "../../hooks/useI18n";
import type { HeroMedia, HomepageSettings, Product } from "../../types";
import { getProductImage, getProductName } from "../../utils/product";

const heroVideoMp4Url = "/hero-ruzo.mp4";
const heroPosterUrl = "/hero-ruzo-poster.webp";
const storyImageUrl = "/products/ruzo/metallic-magenta-set-01.webp";

const defaultHeroMedia: HeroMedia = {
  id: "default-hero",
  mediaType: "VIDEO",
  mediaUrl: heroVideoMp4Url,
  posterUrl: heroPosterUrl,
};

const defaultHomepageSettings: HomepageSettings = {
  discoverUrl: "/collections/all",
  heroMedia: defaultHeroMedia,
};

function HomeHero({
  media, discoverUrl, buttonLabel, videoLabel, copy, primary = false,
}: {
  media: HeroMedia;
  discoverUrl: string;
  buttonLabel: string;
  videoLabel: string;
  copy?: string;
  primary?: boolean;
}) {
  const buttonClassName = "mt-8 inline-flex min-h-12 items-center justify-center border border-[#FFFFFF]/85 bg-[#080808]/10 px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF] backdrop-blur-sm transition hover:border-[#080808] hover:bg-[#080808]";
  const mediaClassName = "absolute inset-0 h-full w-full object-cover object-center";

  return (
    <section className="relative min-h-[calc(100vh-104px)] overflow-hidden bg-[#080808]">
      {media.mediaType === "IMAGE" ? (
        <img
          src={media.mediaUrl}
          alt=""
          loading={primary ? "eager" : "lazy"}
          fetchPriority={primary ? "high" : "auto"}
          className={mediaClassName}
        />
      ) : (
        <video
          src={media.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={media.posterUrl || undefined}
          aria-label={videoLabel}
          className={mediaClassName}
        />
      )}
      <div className="absolute inset-0 bg-[#080808]/34" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(to_top,rgba(8,8,8,0.82),rgba(8,8,8,0.2),rgba(8,8,8,0))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-[1500px] items-end justify-center px-5 pb-14 text-center sm:pb-20 lg:px-8">
        <motion.div
          initial={primary ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl text-[#FFFFFF]"
        >
          {copy ? (
            <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-7 text-[#FFFFFF]/86 sm:text-base">
              {copy}
            </p>
          ) : null}
          {/^https?:\/\//i.test(discoverUrl) ? (
            <a href={discoverUrl} className={buttonClassName}>{buttonLabel}</a>
          ) : (
            <Link to={discoverUrl} className={buttonClassName}>{buttonLabel}</Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function useAutoCarousel(itemCount: number, intervalMs = 3800) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateVisibleCount = () => {
      setVisibleCount(mediaQuery.matches ? 3 : 1);
    };

    updateVisibleCount();
    mediaQuery.addEventListener("change", updateVisibleCount);

    return () => {
      mediaQuery.removeEventListener("change", updateVisibleCount);
    };
  }, []);

  const maxIndex = Math.max(itemCount - visibleCount, 0);
  const boundedIndex = Math.min(index, maxIndex);

  useEffect(() => {
    if (itemCount <= visibleCount) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [itemCount, visibleCount, maxIndex, intervalMs]);

  return {
    index: boundedIndex,
    visibleCount,
    canScroll: itemCount > visibleCount,
    previous: () => setIndex((current) => {
      const safeIndex = Math.min(current, maxIndex);
      return safeIndex <= 0 ? maxIndex : safeIndex - 1;
    }),
    next: () => setIndex((current) => {
      const safeIndex = Math.min(current, maxIndex);
      return safeIndex >= maxIndex ? 0 : safeIndex + 1;
    }),
  };
}

type CarouselArrowButtonProps = {
  direction: "previous" | "next";
  label: string;
  onClick: () => void;
};

function CarouselArrowButton({ direction, label, onClick }: CarouselArrowButtonProps) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const positionClass =
    direction === "previous"
      ? "left-0 -translate-x-2 sm:-translate-x-4"
      : "right-0 translate-x-2 sm:translate-x-4";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-[42%] z-10 grid h-11 w-11 place-items-center bg-[#FFFFFF]/94 text-[#080808] shadow-[0_12px_34px_rgba(8,8,8,0.12)] backdrop-blur transition hover:bg-[#080808] hover:text-[#FFFFFF] ${positionClass}`}
    >
      <Icon className="h-6 w-6 stroke-[2.2]" />
    </button>
  );
}

export function HomePage() {
  const { language, dir, t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings>(defaultHomepageSettings);

  useEffect(() => {
    let isMounted = true;

    productsApi.getAll()
      .then((productsData) => {
        if (isMounted) {
          setProducts(productsData);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    homepageApi.getSettings()
      .then((settings) => {
        if (isMounted) {
          setHomepageSettings(settings);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const newArrivals = useMemo(() => {
    return products
      .filter((product) => product.isNew)
      .sort((first, second) => (first.newArrivalOrder ?? 999) - (second.newArrivalOrder ?? 999));
  }, [products]);

  const bestSellers = useMemo(() => {
    return products
      .filter((product) => product.isBestSeller)
      .sort((first, second) => (first.bestSellerOrder ?? 999) - (second.bestSellerOrder ?? 999));
  }, [products]);

  const discoverCollections = useMemo(() => {
    return products
      .filter((product) => product.discoverCollection)
      .sort(
        (first, second) =>
          (first.discoverCollectionOrder ?? 999) - (second.discoverCollectionOrder ?? 999),
      );
  }, [products]);

  // const heroProductImage = useMemo(() => {
  //   const candidate = bestSellers[0] ?? newArrivals[0] ?? products[0];
  //   return candidate ? getProductImage(candidate) : storyImageUrl;
  // }, [bestSellers, newArrivals, products]);

  const isRtl = dir === "rtl";
  const heroCopy = t("heroCopy");

  const copy =
    language === "ar"
      ? {
          discoverCollection: "اكتشفي المجموعة",
          viewAll: "عرض الكل",
          readMore: "اكتشفي المزيد",
          storyLabel: "القصة",
          storyTitle: "مصممة لإطلالات بيروت اليومية.",
          storyMeta: "Sets · Dresses · Bottoms · Tops · Outerwear",
          manifesto:
            "روزو علامة أزياء نسائية من بيروت، تصمم أطقم الساتان، الفساتين، القطع العلوية، القطع السفلية، والطبقات الخارجية بإحساس أنيق ينتقل معك من النهار إلى الليل.",
          storyCopy:
            "من الأطقم اللامعة إلى الفساتين الانسيابية والقمصان الشفافة، كل قطعة مصممة لتمنح حضوراً ناعماً، واضحاً، وسهل التنسيق.",
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
          storyTitle: "Made for Beirut light, late plans, and polished ease.",
          storyMeta: "Sets · Dresses · Bottoms · Tops · Outerwear",
          manifesto:
            "Rüzo is a Beirut-born womenswear label shaped around satin sets, fluid dresses, sharp tops, tailored bottoms, and outerwear made to move from day to night.",
          storyCopy:
            "From metallic sets to clean black dresses and sheer layers, each piece is curated for a confident silhouette, soft shine, and a wardrobe that feels ready without trying too hard.",
          newInTitle: "New in: Rüzo collection",
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

  const primaryCollectionPath = homepageSettings.discoverUrl || "/collections/all";
  const heroMedia = homepageSettings.heroMedia ?? defaultHeroMedia;
  const secondaryHero = homepageSettings.secondaryHero;

  const newArrivalsCarousel = useAutoCarousel(newArrivals.length);
  const collectionsCarousel = useAutoCarousel(discoverCollections.length);
  const bestSellersCarousel = useAutoCarousel(bestSellers.length);
  const productPreviousLabel = language === "ar" ? "المنتج السابق" : "Previous product";
  const productNextLabel = language === "ar" ? "المنتج التالي" : "Next product";
  const collectionPreviousLabel = language === "ar" ? "المجموعة السابقة" : "Previous collection";
  const collectionNextLabel = language === "ar" ? "المجموعة التالية" : "Next collection";

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

  const brandAssurances =
    language === "ar"
      ? [
          {
            icon: Truck,
            title: "شحن عالمي",
            copy: "نوصل طلبك إلى بابك",
          },
          {
            icon: Shirt,
            title: "خامات فاخرة",
            copy: "اختيار دقيق لأجود الخامات",
          },
          {
            icon: Leaf,
            title: "صناعة مسؤولة",
            copy: "مصممة بعناية ومسؤولية",
          },
        ]
      : [
          {
            icon: Truck,
            title: t("worldwideShipping"),
            copy: t("worldwideShippingCopy"),
          },
          {
            icon: Shirt,
            title: "Premium Materials",
            copy: "Finest quality materials selected",
          },
          {
            icon: Leaf,
            title: "Ethically Made",
            copy: "Crafted with care and responsibility",
          },
        ];

  return (
    <div className="bg-[#FFFFFF]">
      <Seo
        title="RÜZO | Beirut Womenswear"
        description="Shop RÜZO womenswear: satin sets, dresses, bottoms, tops, and outerwear designed for polished everyday dressing."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.xn--rzo-hoa.com/#organization",
              name: "RÜZO",
              alternateName: ["Rüzo", "rüzo"],
              url: "https://www.xn--rzo-hoa.com/",
              logo: "https://www.xn--rzo-hoa.com/ruzo-share-logo.jpeg",
              sameAs: [INSTAGRAM_URL],
            },
            {
              "@type": "WebSite",
              "@id": "https://www.xn--rzo-hoa.com/#website",
              name: "RÜZO",
              alternateName: ["Rüzo", "rüzo"],
              url: "https://www.xn--rzo-hoa.com/",
              publisher: {
                "@id": "https://www.xn--rzo-hoa.com/#organization",
              },
            },
            {
              "@type": "ClothingStore",
              "@id": "https://www.xn--rzo-hoa.com/#store",
              name: "RÜZO",
              url: "https://www.xn--rzo-hoa.com/",
              image: `https://www.xn--rzo-hoa.com${storyImageUrl}`,
              priceRange: "$$",
            },
          ],
        }}
      />

      <HomeHero
        primary
        media={heroMedia}
        discoverUrl={primaryCollectionPath}
        buttonLabel={copy.discoverCollection}
        videoLabel={t("heroVideoLabel")}
        copy={heroCopy}
      />
      {secondaryHero?.enabled && secondaryHero.heroMedia ? (
        <HomeHero
          media={secondaryHero.heroMedia}
          discoverUrl={secondaryHero.discoverUrl}
          buttonLabel={copy.discoverCollection}
          videoLabel={t("heroVideoLabel")}
        />
      ) : null}

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]">
              {copy.trendingTitle}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[#080808] sm:text-4xl">
              {t("bestSellers")}
            </h2>
          </div>
          <Link
            to="/collections/best-sellers"
            className="luxury-link-underline shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]"
          >
            {copy.viewAll}
          </Link>
        </div>

        <div className="mt-9">
          {isLoading ? (
            <ProductSkeletonGrid />
          ) : bestSellers.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{
                    transform: `translateX(-${bestSellersCarousel.index * (100 / bestSellersCarousel.visibleCount)}%)`,
                  }}
                >
                  {bestSellers.map((product, productIndex) => (
                    <div key={product.id} className="min-w-0 shrink-0 basis-full px-1.5 sm:px-2 lg:basis-1/3 lg:px-4">
                      <ProductCard product={product} priority={productIndex < bestSellersCarousel.visibleCount} />
                    </div>
                  ))}
                </div>
              </div>

              {bestSellersCarousel.canScroll ? (
                <>
                  <button
                    type="button"
                    aria-label={productPreviousLabel}
                    onClick={bestSellersCarousel.previous}
                    className="absolute left-0 top-[42%] z-10 grid h-11 w-11 -translate-x-2 place-items-center bg-[#FFFFFF]/94 text-[#080808] shadow-[0_12px_34px_rgba(8,8,8,0.12)] backdrop-blur transition hover:bg-[#080808] hover:text-[#FFFFFF] sm:-translate-x-4"
                  >
                    <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
                  </button>
                  <button
                    type="button"
                    aria-label={productNextLabel}
                    onClick={bestSellersCarousel.next}
                    className="absolute right-0 top-[42%] z-10 grid h-11 w-11 translate-x-2 place-items-center bg-[#FFFFFF]/94 text-[#080808] shadow-[0_12px_34px_rgba(8,8,8,0.12)] backdrop-blur transition hover:bg-[#080808] hover:text-[#FFFFFF] sm:translate-x-4"
                  >
                    <ChevronRight className="h-6 w-6 stroke-[2.2]" />
                  </button>
                </>
              ) : null}
            </div>
          ) : (
            <p className="border border-[#080808]/10 px-5 py-10 text-center text-sm text-[#080808]/66">
              {t("noProducts")}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]">
              {t("newArrivals")}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[#080808] sm:text-4xl">
              {copy.newInTitle}
            </h2>
          </div>
          <Link
            to="/collections/new-arrivals"
            className="luxury-link-underline shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]"
          >
            {copy.viewAll}
          </Link>
        </div>

        <div className="mt-9">
          {isLoading ? (
            <ProductSkeletonGrid />
          ) : newArrivals.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{
                    transform: `translateX(-${newArrivalsCarousel.index * (100 / newArrivalsCarousel.visibleCount)}%)`,
                  }}
                >
                  {newArrivals.map((product, productIndex) => (
                    <div key={product.id} className="min-w-0 shrink-0 basis-full px-1.5 sm:px-2 lg:basis-1/3 lg:px-4">
                      <ProductCard product={product} priority={productIndex < newArrivalsCarousel.visibleCount} />
                    </div>
                  ))}
                </div>
              </div>

              {newArrivalsCarousel.canScroll ? (
                <>
                  <CarouselArrowButton
                    direction="previous"
                    label={productPreviousLabel}
                    onClick={newArrivalsCarousel.previous}
                  />
                  <CarouselArrowButton
                    direction="next"
                    label={productNextLabel}
                    onClick={newArrivalsCarousel.next}
                  />
                </>
              ) : null}
            </div>
          ) : (
            <p className="border border-[#080808]/10 px-5 py-10 text-center text-sm text-[#080808]/66">
              {t("noProducts")}
            </p>
          )}
        </div>
      </section>

      {discoverCollections.length > 0 ? (
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

          <div className="relative mt-10">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${collectionsCarousel.index * (100 / collectionsCarousel.visibleCount)}%)`,
                }}
              >
                {discoverCollections.map((product, productIndex) => {
                  const productImage = getProductImage(product);
                  const productName = getProductName(product, language);

                  return (
                    <div key={product.id} className="min-w-0 shrink-0 basis-full px-1.5 sm:px-2 lg:basis-1/3 lg:px-4">
                      <Link
                        to={`/products/${product.slug}`}
                        className="group relative block aspect-[3/4] overflow-hidden bg-[#080808]"
                      >
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            loading={productIndex < collectionsCarousel.visibleCount ? "eager" : "lazy"}
                            fetchPriority={productIndex < collectionsCarousel.visibleCount ? "high" : "auto"}
                            decoding="async"
                            width={900}
                            height={1200}
                            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                            className="product-image absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-[linear-gradient(145deg,#FFFFFF_0%,#FFFFFF_34%,#080808_35%,#080808_100%)]" />
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.78),rgba(8,8,8,0.22),rgba(8,8,8,0.02))]" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFFFFF] sm:p-6">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFFFFF]/78">
                            {product.category
                              ? language === "ar"
                                ? product.category.nameAr
                                : product.category.nameEn
                              : t("ruzoEdit")}
                          </p>
                          <h3 className="font-display mt-2 text-3xl leading-tight sm:text-4xl lg:text-3xl xl:text-4xl">
                            {productName}
                          </h3>
                          <span className="mt-5 inline-flex min-h-9 items-center gap-3 border border-[#FFFFFF]/78 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFFFFF] transition group-hover:border-[#080808] group-hover:bg-[#080808]">
                            {t("shopNow")}
                            <ArrowRight className={isRtl ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {collectionsCarousel.canScroll ? (
              <>
                <CarouselArrowButton
                  direction="previous"
                  label={collectionPreviousLabel}
                  onClick={collectionsCarousel.previous}
                />
                <CarouselArrowButton
                  direction="next"
                  label={collectionNextLabel}
                  onClick={collectionsCarousel.next}
                />
              </>
            ) : null}
          </div>
        </div>
      </section>
      ) : null}

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
              className="mt-8 inline-flex min-h-12 items-center justify-center border border-[#FFFFFF]/75 px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF] transition hover:border-[#080808] hover:bg-[#080808]"
            >
              {t("shopNow")}
            </Link>
          </div>
        </div>
      </section> */}

      <section className="bg-[#FFFFFF]">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#080808]">
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
                  <Icon className="h-8 w-8 stroke-[1.6] text-[#080808]" />
                  <h3 className="mt-5 text-sm font-semibold uppercase leading-6 tracking-[0.16em] text-[#080808]">
                    {promise.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#080808]/68">{promise.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mx-auto max-w-[1500px] border-t border-[#080808]/10 px-5 pb-16 pt-10 sm:pb-20 lg:px-8">
          <div className="grid gap-10 text-center sm:grid-cols-3">
            {brandAssurances.map((assurance) => {
              const Icon = assurance.icon;

              return (
                <div key={assurance.title} className="mx-auto max-w-xs">
                  <Icon className="mx-auto h-8 w-8 stroke-[1.5] text-[#080808]" />
                  <h3 className="mt-6 text-base font-semibold uppercase leading-6 text-[#080808]">
                    {assurance.title}
                  </h3>
                  <p className="mt-2 text-base uppercase leading-6 text-[#080808]/82">{assurance.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
