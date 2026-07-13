import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { categoriesApi } from "../../api/categories";
import { useI18n } from "../../hooks/useI18n";
import { selectCartTotals, useCartStore } from "../../store/cartStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import type { Category } from "../../types";
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
          title: isArabic ? "الملابس" : "Ready to wear",
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

  const navItems: TopBarItem[] = [
    {
      to: categoryLinks[0]?.to ?? "/",
      label: t("shop"),
      megaMenu: [
        ...(categoryColumn ? [categoryColumn] : []),
        {
          title: isArabic ? "اكتشفي" : "Discover",
          links: [
            { to: categoryLinks[0]?.to ?? "/", label: t("newArrivals"), description: isArabic ? "آخر قطع RÜZO" : "The newest RÜZO pieces" },
            { to: categoryLinks[0]?.to ?? "/", label: t("bestSellers"), description: isArabic ? "القطع الأكثر طلبا" : "Customer favorite silhouettes" },
            { to: "/about", label: isArabic ? "قصة RÜZO" : "The RÜZO story", description: isArabic ? "عن العلامة" : "Beirut womenswear, softly polished" },
          ],
        },
        {
          title: isArabic ? "قطع مختارة" : "Featured pieces",
          links: [
            { to: "/products/metallic-magenta-set", label: "Metallic Magenta Set" },
            { to: "/products/black-midi-dress", label: "Black Midi Dress" },
            { to: "/products/lemon-satin-set", label: "Lemon Satin Set" },
            { to: "/products/red-halter-dress", label: "Red Halter Dress" },
          ],
        },
      ],
    },
    {
      to: categoryLinks[0]?.to ?? "/",
      label: t("collectionsNav"),
      megaMenu: collectionsColumn ? [collectionsColumn] : undefined,
    },
    { to: "/about", label: t("aboutNav") },
  ];

  return (
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
  );
}
