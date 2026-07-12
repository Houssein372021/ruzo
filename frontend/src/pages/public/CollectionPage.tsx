import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { productsApi } from "../../api/products";
import { EmptyState } from "../../components/common/EmptyState";
import { Seo } from "../../components/common/Seo";
import { ProductSkeletonGrid } from "../../components/common/Skeleton";
import { ProductCard } from "../../components/product/ProductCard";
import { useI18n } from "../../hooks/useI18n";
import type { Product } from "../../types";
import type { TranslationKey } from "../../i18n/translations";
import { uniqueValues } from "../../utils/product";

type CollectionPageProps = {
  categorySlug: string;
  titleKey: TranslationKey;
};

const collectionTitleKeys: Record<string, TranslationKey> = {
  sets: "sets",
  "sport-bras": "sportsBras",
  "sports-bras": "sportsBras",
  bottoms: "bottoms",
};

export function DynamicCollectionPage() {
  const { slug } = useParams();
  const categorySlug = slug ?? "sets";

  return (
    <CollectionPage
      categorySlug={categorySlug}
      titleKey={collectionTitleKeys[categorySlug] ?? "shopByCategory"}
    />
  );
}

type SortOption = "newest" | "price-low" | "price-high";
type PriceOption = "all" | "under-50" | "over-50";

const filterOptionTranslationKeys: Record<string, TranslationKey> = {
  all: "all",
  "in-stock": "inStock",
  "under-50": "under50",
  "over-50": "over50",
  newest: "newest",
  "price-low": "priceLowHigh",
  "price-high": "priceHighLow",
};

export function CollectionPage({ categorySlug, titleKey }: CollectionPageProps) {
  const { t } = useI18n();
  const normalizedCategorySlug = categorySlug === "sports-bras" ? "sport-bras" : categorySlug;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [price, setPrice] = useState<PriceOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    productsApi
      .getAll()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
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

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOpen]);

  const categoryProducts = useMemo(
    () => products.filter((product) => product.category?.slug === normalizedCategorySlug),
    [normalizedCategorySlug, products],
  );

  const sizes = useMemo(
    () => uniqueValues(categoryProducts.flatMap((product) => product.variants.map((variant) => variant.size))),
    [categoryProducts],
  );

  const colors = useMemo(
    () => uniqueValues(categoryProducts.flatMap((product) => product.variants.map((variant) => variant.color))),
    [categoryProducts],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filtered = categoryProducts.filter((product) => {
      const matchesSize = size === "all" || product.variants.some((variant) => variant.size === size);
      const matchesColor = color === "all" || product.variants.some((variant) => variant.color === color);
      const matchesAvailability =
        availability === "all" || product.variants.some((variant) => variant.stock > 0);
      const matchesPrice =
        price === "all" ||
        (price === "under-50" ? product.price < 50 : product.price >= 50);
      const searchableProduct = [
        product.nameEn,
        product.nameAr,
        product.slug,
        product.descriptionEn,
        product.descriptionAr,
        product.category?.nameEn,
        product.category?.nameAr,
        product.category?.slug,
        ...product.variants.flatMap((variant) => [variant.color, variant.size]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchableProduct.includes(normalizedSearch);

      return matchesSearch && matchesSize && matchesColor && matchesAvailability && matchesPrice;
    });

    return [...filtered].sort((first, second) => {
      if (sort === "price-low") {
        return first.price - second.price;
      }
      if (sort === "price-high") {
        return second.price - first.price;
      }
      return 0;
    });
  }, [availability, categoryProducts, color, price, searchQuery, size, sort]);

  const collectionName = t(titleKey);
  const activeFilterCount = [
    size !== "all",
    color !== "all",
    availability !== "all",
    price !== "all",
    sort !== "newest",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSize("all");
    setColor("all");
    setAvailability("all");
    setPrice("all");
    setSort("newest");
  };

  const renderFilterControls = () => (
    <>
      <FilterSelect label={t("size")} value={size} onChange={setSize} options={["all", ...sizes]} />
      <FilterSelect label={t("color")} value={color} onChange={setColor} options={["all", ...colors]} />
      <FilterSelect
        label={t("availability")}
        value={availability}
        onChange={setAvailability}
        options={["all", "in-stock"]}
      />
      <FilterSelect
        label={t("price")}
        value={price}
        onChange={(value) => setPrice(value as PriceOption)}
        options={["all", "under-50", "over-50"]}
      />
      <FilterSelect
        label={t("sort")}
        value={sort}
        onChange={(value) => setSort(value as SortOption)}
        options={["newest", "price-low", "price-high"]}
      />
    </>
  );

  return (
    <>
      <Seo
        title={`${collectionName} | RÜZO Activewear`}
        description={`Shop ${collectionName} by RÜZO at rüzo. Women's activewear with sculpted support and refined everyday comfort.`}
        path={`/collections/${normalizedCategorySlug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: `${collectionName} | RÜZO`,
              url: `https://www.rüzo.com/collections/${normalizedCategorySlug}`,
              isPartOf: {
                "@id": "https://www.rüzo.com/#website",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.rüzo.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: collectionName,
                  item: `https://www.rüzo.com/collections/${normalizedCategorySlug}`,
                },
              ],
            },
            {
              "@type": "ItemList",
              name: `${collectionName} products`,
              itemListElement: categoryProducts.slice(0, 12).map((product, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `https://www.rüzo.com/products/${product.slug}`,
                name: product.nameEn,
              })),
            },
          ],
        }}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-[#ded2c5] pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b725f]">{t("collectionEyebrow")}</p>
            <h1 className="mt-3 text-4xl font-semibold text-[#111111] sm:text-5xl">{collectionName}</h1>
          </div>
          <div className="hidden items-center gap-2 text-sm text-[#6d6258] lg:flex">
            <SlidersHorizontal className="h-4 w-4" />
            {t("productsCount", { count: String(filteredProducts.length) })}
          </div>
        </div>

        <div className="mt-5 max-w-3xl">
          <label className="relative block">
            <span className="sr-only">{t("searchProducts")}</span>
            <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b725f] [inset-inline-start:1rem]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchProducts")}
              className="h-14 w-full border border-[#d8cbbd] bg-[#fbf7f1] px-4 text-base text-[#111111] outline-none transition placeholder:text-[#aa9a8b] focus:border-[#4b2e24] focus:bg-white focus:shadow-[0_0_0_3px_rgba(75,46,36,0.08)] [padding-inline-end:3rem] [padding-inline-start:3rem] sm:h-16 sm:text-lg"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label={t("clearSearch")}
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center border border-transparent text-[#8b725f] transition hover:border-[#d8cbbd] hover:bg-[#efe4d6] [inset-inline-end:0.75rem]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 lg:hidden">
          <div className="flex items-center gap-2 text-sm text-[#6d6258]">
            <SlidersHorizontal className="h-4 w-4" />
            {t("productsCount", { count: String(filteredProducts.length) })}
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 border border-[#4b2e24] bg-[#4b2e24] px-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8f4ec] transition hover:bg-[#3a2118]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{t("filters")}</span>
            {activeFilterCount > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center bg-[#f8f4ec] px-1 text-xs text-[#4b2e24]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden space-y-5 lg:block">{renderFilterControls()}</aside>

          <div>
            {isLoading ? (
              <ProductSkeletonGrid />
            ) : filteredProducts.length === 0 ? (
              <EmptyState title={t("noProducts")} actionTo="/" />
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {isFilterOpen ? (
        <div
          aria-labelledby="collection-filters-title"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
        >
          <button
            type="button"
            aria-label={t("closeFilters")}
            className="absolute inset-0 h-full w-full bg-black/35"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-lg bg-[#f8f3eb] px-4 pb-6 pt-4 shadow-2xl">
            <div className="mx-auto h-1 w-10 bg-[#cbbca9]" />
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <h2 id="collection-filters-title" className="text-2xl font-semibold text-[#111111]">
                  {t("filters")}
                </h2>
                <p className="mt-1 text-sm text-[#6d6258]">
                  {t("productsCount", { count: String(filteredProducts.length) })}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("closeFilters")}
                onClick={() => setIsFilterOpen(false)}
                className="grid h-10 w-10 place-items-center border border-[#d8cbbd] bg-[#fbf7f1] text-[#4b2e24] transition hover:bg-[#efe4d6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">{renderFilterControls()}</div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="h-12 border border-[#d8cbbd] bg-[#f8f4ec] px-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#4b2e24] transition enabled:hover:border-[#4b2e24] enabled:hover:bg-[#efe4d6] disabled:cursor-not-allowed disabled:text-[#b2a493]"
              >
                {t("clearFilters")}
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="h-12 bg-[#4b2e24] px-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#f8f4ec] transition hover:bg-[#3a2118]"
              >
                {t("showProducts", { count: String(filteredProducts.length) })}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const { t } = useI18n();

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8b725f]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-[#d8cbbd] bg-white px-3 text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {filterOptionTranslationKeys[option] ? t(filterOptionTranslationKeys[option]) : option.replaceAll("-", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
