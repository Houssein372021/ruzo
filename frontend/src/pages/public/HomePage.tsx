import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Ban, CreditCard, Headphones, Package } from "lucide-react";
import { categoriesApi } from "../../api/categories";
import { productsApi } from "../../api/products";
import { Seo } from "../../components/common/Seo";
import { SectionHeading } from "../../components/common/SectionHeading";
import { ProductSkeletonGrid } from "../../components/common/Skeleton";
import { ProductCard } from "../../components/product/ProductCard";
import { useI18n } from "../../hooks/useI18n";
import type { Category, Product } from "../../types";

const heroVideoUrl = "/hero.mp4";
const editorialImageUrl = "/editorial-ruzo.png";

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
    <div>
      <Seo
        title="RÜZO | Women's Activewear at rüzo"
        description="Shop RÜZO activewear at rüzo: sculpting sets, sport bras, leggings, and everyday activewear for women."
        path="/"
        image="/editorial-ruzo.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.rüzo.com/#organization",
              name: "RÜZO",
              alternateName: ["Rüzo", "Rüzo", "rüzo"],
              url: "https://www.rüzo.com/",
              logo: "https://www.rüzo.com/site-icon-512.png",
              sameAs: ["https://www.instagram.com/ruzoofficial/"],
            },
            {
              "@type": "WebSite",
              "@id": "https://www.rüzo.com/#website",
              name: "RÜZO",
              alternateName: ["Rüzo", "Rüzo", "rüzo"],
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
      <section className="relative h-[80vh] min-h-[520px] overflow-hidden bg-[#111111]">
        <video
          src={heroVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={t("heroVideoLabel")}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/10 via-[#111111]/20 to-[#111111]/50" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-5 pb-16 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-[#F8F4EC]"
          >
            <p className="fade-up text-xs font-semibold uppercase tracking-display text-[#D8C3A5]">
              {t("newArrivals")}
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-[4rem] leading-[0.92] text-balance sm:text-8xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-md text-sm font-semibold leading-7 text-[#f7efe4] sm:text-base">
              {t("heroCopy")}
            </p>
            <Link
              to="/collections/sets"
              className="mt-9 inline-flex items-center gap-3 border border-[#F8F4EC]/85 bg-transparent px-8 py-4 text-xs font-semibold uppercase tracking-display text-[#F8F4EC] transition hover:bg-[#F8F4EC]/12"
            >
              {t("shopNow")}
              <ArrowRight className={dir === "rtl" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
        <SectionHeading title={t("newArrivals")} copy={t("newArrivalsCopy")} />
        <div className="mt-12">
          {isLoading ? (
            <ProductSkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <SectionHeading title={t("collectionsTitle")} copy={t("collectionsCopy")} />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/collections/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-[#e7ded2]"
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={language === "ar" ? category.nameAr : category.nameEn}
                    className="product-image absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#D8C3A5,#F8F4EC_55%,#4B2E24)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/55 to-transparent" />
                <div className="absolute bottom-0 p-7 text-[#F8F4EC]">
                  <p className="text-xs font-semibold uppercase tracking-display text-[#D8C3A5]">
                    {t("ruzoEdit")}
                  </p>
                  <h3 className="font-display mt-3 text-3xl">
                    {language === "ar" ? category.nameAr : category.nameEn}
                  </h3>
                  <span className="mt-5 inline-flex items-center gap-3 border border-[#F8F4EC]/80 bg-transparent px-5 py-3 text-[11px] font-semibold uppercase tracking-display text-[#F8F4EC] transition group-hover:bg-[#F8F4EC]/12">
                    {t("shopNow")}
                    <ArrowRight className={dir === "rtl" ? "h-3.5 w-3.5 rotate-180" : "h-3.5 w-3.5"} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#ded2c5] bg-[#fbf7f1] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <SectionHeading title={t("shoppingAssuranceTitle")} copy={t("shoppingAssuranceCopy")} />
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4">
            {servicePromises.map((promise) => {
              const Icon = promise.icon;

              return (
                <div key={promise.title} className="text-[#4b2e24]">
                  <Icon className="h-9 w-9 stroke-[1.8] sm:h-12 sm:w-12 sm:stroke-[1.6]" />
                  <h3 className="mt-5 text-base font-bold leading-tight tracking-normal text-[#111111] sm:mt-8 sm:text-2xl sm:font-semibold">
                    {promise.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#6d6258] sm:mt-4 sm:text-base sm:leading-8">
                    {promise.copy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid min-h-[560px] lg:grid-cols-2">
        <div className="flex items-center bg-[#4B2E24] px-6 py-16 text-[#F8F4EC] sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-display text-[#D8C3A5]">{t("editorial")}</p>
            <h2 className="font-display mt-5 text-5xl leading-tight sm:text-6xl">
              {t("editorialTitle")}
            </h2>
            <p className="mt-6 text-sm leading-8 text-[#eadfce]">
              {t("editorialCopy")}
            </p>
          </div>
        </div>
        <img
          src={editorialImageUrl}
          alt=""
          className="min-h-[420px] w-full object-cover lg:h-full"
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
        <SectionHeading title={t("bestSellers")} copy={t("bestSellersCopy")} />
        <div className="mt-12">
          {isLoading ? (
            <ProductSkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
