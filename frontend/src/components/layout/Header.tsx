import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, ShoppingBag, X } from "lucide-react";
import { categoriesApi } from "../../api/categories";
import { productsApi } from "../../api/products";
import { useI18n } from "../../hooks/useI18n";
import { selectCartTotals, useCartStore } from "../../store/cartStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import type { Category, Language, Product } from "../../types";
import { formatCurrency } from "../../utils/format";
import { getProductImage, getProductName } from "../../utils/product";
import { TopBar, type TopBarItem, type TopBarMegaMenuColumn } from "./TopBar";

function getCategoryLabel(category: Category, isArabic: boolean) {
  return isArabic ? category.nameAr : category.nameEn;
}

export function Header() {
  const { language, toggleLanguage, t } = useI18n();
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = useCartStore((state) => selectCartTotals(state.items).quantity);
  const favoriteCount = useFavoritesStore((state) => state.items.length);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isArabic = language === "ar";

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

  useEffect(() => {
    let isMounted = true;

    Promise.all([productsApi.getAll(), productsApi.getFeaturedMenu()])
      .then(([allProducts, menuProducts]) => {
        if (isMounted) {
          setProducts(allProducts);
          setFeaturedProducts(menuProducts);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setFeaturedProducts([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const categoryLinks = useMemo(
    () =>
      categories.map((category) => ({
        to: `/collections/${category.slug}`,
        label: getCategoryLabel(category, isArabic),
      })),
    [categories, isArabic],
  );

  const categoryColumn: TopBarMegaMenuColumn | null =
    categoryLinks.length > 0
      ? {
          title: isArabic ? "Ready to wear" : "Ready to wear",
          links: categoryLinks,
        }
      : null;

  const collectionsColumn: TopBarMegaMenuColumn | null =
    categoryLinks.length > 0
      ? {
          title: t("collectionsNav"),
          links: categoryLinks,
        }
      : null;

  const featuredMenuLinks = useMemo(
    () =>
      featuredProducts.slice(0, 4).map((product) => ({
        to: `/products/${product.slug}`,
        label: getProductName(product, language),
      })),
    [featuredProducts, language],
  );

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return products
      .filter((product) => {
        const categoryName = product.category
          ? `${product.category.nameEn} ${product.category.nameAr} ${product.category.slug}`
          : "";
        const variants = product.variants.map((variant) => `${variant.color} ${variant.size}`).join(" ");
        return `${product.nameEn} ${product.nameAr} ${product.slug} ${product.descriptionEn ?? ""} ${product.descriptionAr ?? ""} ${categoryName} ${variants}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [products, searchQuery]);

  const shopMegaMenu: TopBarMegaMenuColumn[] = [
    ...(categoryColumn ? [categoryColumn] : []),
    {
      title: isArabic ? "Discover" : "Discover",
      links: [
        {
          to: categoryLinks[0]?.to ?? "/",
          label: t("newArrivals"),
          description: isArabic ? "Newest RUZO pieces" : "The newest RUZO pieces",
        },
        {
          to: categoryLinks[0]?.to ?? "/",
          label: t("bestSellers"),
          description: isArabic ? "Customer favorite silhouettes" : "Customer favorite silhouettes",
        },
        {
          to: "/about",
          label: isArabic ? "The RUZO story" : "The RUZO story",
          description: isArabic ? "About the brand" : "Beirut womenswear, softly polished",
        },
      ],
    },
    ...(featuredMenuLinks.length > 0
      ? [
          {
            title: isArabic ? "Featured pieces" : "Featured pieces",
            links: featuredMenuLinks,
          },
        ]
      : []),
  ];

  const navItems: TopBarItem[] = [
    {
      to: categoryLinks[0]?.to ?? "/",
      label: t("shop"),
      megaMenu: shopMegaMenu,
    },
    {
      to: categoryLinks[0]?.to ?? "/",
      label: t("collectionsNav"),
      megaMenu: collectionsColumn ? [collectionsColumn] : undefined,
    },
    { to: "/about", label: t("aboutNav") },
  ];

  return (
    <>
      <TopBar
        navItems={navItems}
        actions={
          <div className="flex flex-col items-end gap-1.5">
            <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#080808]/65 lg:flex">
              <span>{language === "en" ? t("languageEnglish") : t("languageArabic")}</span>
              <span className="h-3 w-px bg-[#6B0F1A]/45" />
              <span>{t("lebanon")}</span>
            </div>

            <div className="flex items-center gap-1 text-[#080808] sm:gap-3">
              <button
                type="button"
                className="grid h-7 min-w-7 place-items-center border border-[#080808]/12 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition hover:border-[#6B0F1A] hover:text-[#6B0F1A] sm:px-2 sm:text-[11px] sm:tracking-[0.18em]"
                onClick={toggleLanguage}
                aria-label={t("switchLanguage")}
              >
                {language === "en" ? "AR" : "EN"}
              </button>
              <button
                type="button"
                aria-label={t("search")}
                className="grid h-7 w-6 place-items-center transition-colors hover:text-[#6B0F1A] sm:w-7"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </button>
              <Link
                to="/favorites"
                aria-label={t("favorites")}
                className="relative grid h-7 w-6 place-items-center transition-colors hover:text-[#6B0F1A] sm:w-7"
              >
                <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                {favoriteCount > 0 ? (
                  <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B0F1A] px-1 text-[10px] leading-none text-[#FFFFFF]">
                    {favoriteCount}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                aria-label={t("cart")}
                className="relative grid h-7 w-6 place-items-center transition-colors hover:text-[#6B0F1A] sm:w-7"
                onClick={openCart}
              >
                <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                {cartCount > 0 ? (
                  <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B0F1A] px-1 text-[10px] leading-none text-[#FFFFFF]">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        }
        mobileActions={
          <button
            type="button"
            className="inline-flex h-9 min-w-11 items-center justify-center border border-[#080808]/14 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#080808] transition-colors hover:border-[#6B0F1A] hover:text-[#6B0F1A]"
            onClick={toggleLanguage}
            aria-label={t("switchLanguage")}
          >
            {language === "en" ? t("languageArabic") : t("languageEnglish")}
          </button>
        }
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        query={searchQuery}
        results={searchResults}
        language={language}
        onQueryChange={setSearchQuery}
        onClose={() => setIsSearchOpen(false)}
        searchPlaceholder={t("searchProducts")}
        emptyLabel={isArabic ? "No products found" : "No products found"}
      />
    </>
  );
}

function SearchOverlay({
  isOpen,
  query,
  results,
  language,
  onQueryChange,
  onClose,
  searchPlaceholder,
  emptyLabel,
}: {
  isOpen: boolean;
  query: string;
  results: Product[];
  language: Language;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  searchPlaceholder: string;
  emptyLabel: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#080808]/35 px-4 py-6 backdrop-blur-sm sm:px-6" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-3xl border border-[#080808]/10 bg-[#FFFFFF] shadow-[0_28px_90px_rgba(8,8,8,0.18)]">
        <div className="flex items-center gap-3 border-b border-[#080808]/10 px-4 py-4 sm:px-6">
          <Search className="h-5 w-5 shrink-0 text-[#6B0F1A]" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-[#080808] outline-none placeholder:text-[#080808]/38"
          />
          <button
            type="button"
            aria-label="Close search"
            className="grid h-10 w-10 place-items-center text-[#080808] transition hover:text-[#6B0F1A]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6">
          {query.trim() && results.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#080808]/55">{emptyLabel}</p>
          ) : null}

          <div className="grid gap-3">
            {results.map((product) => {
              const image = getProductImage(product);
              const productName = getProductName(product, language);

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border border-[#080808]/8 p-2 transition hover:border-[#6B0F1A]/25 hover:bg-[#6B0F1A]/5"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#F7F4EF]">
                    {image ? (
                      <img
                        src={image}
                        alt={productName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#080808]">{productName}</p>
                    {product.category ? (
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B0F1A]">
                        {language === "ar" ? product.category.nameAr : product.category.nameEn}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-[#080808]">
                    {formatCurrency(product.salePrice ?? product.price, language)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
