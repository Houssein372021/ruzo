import { Link } from "react-router-dom";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { selectCartTotals, useCartStore } from "../../store/cartStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { TopBar } from "./TopBar";

const navItems = [
  { to: "/collections/sets", key: "shop" },
  { to: "/collections/bottoms", key: "collectionsNav" },
  { to: "/about", key: "aboutNav" },
] as const;

export function Header() {
  const { language, toggleLanguage, t } = useI18n();
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = useCartStore((state) => selectCartTotals(state.items).quantity);
  const favoriteCount = useFavoritesStore((state) => state.items.length);

  return (
    <TopBar
      navItems={navItems.map((item) => ({ to: item.to, label: t(item.key) }))}
      actions={
        <div className="flex flex-col items-end gap-1.5">
          <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#080808]/65 lg:flex">
            <span>{language === "en" ? t("languageEnglish") : t("languageArabic")}</span>
            <span className="h-3 w-px bg-[#6B0F1A]/45" />
            <span>{t("lebanon")}</span>
          </div>

          <div className="flex items-center gap-3 text-[#080808]">
            <button
              type="button"
              className="grid h-7 min-w-7 place-items-center border border-[#080808]/12 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-[#6B0F1A] hover:text-[#6B0F1A]"
              onClick={toggleLanguage}
              aria-label={t("switchLanguage")}
            >
              {language === "en" ? "AR" : "EN"}
            </button>
            <button
              type="button"
              aria-label={t("search")}
              className="grid h-7 w-7 place-items-center transition-colors hover:text-[#6B0F1A]"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/favorites"
              aria-label={t("favorites")}
              className="relative grid h-7 w-7 place-items-center transition-colors hover:text-[#6B0F1A]"
            >
              <Heart className="h-[18px] w-[18px]" />
              {favoriteCount > 0 ? (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B0F1A] px-1 text-[10px] leading-none text-[#FFFFFF]">
                  {favoriteCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              aria-label={t("cart")}
              className="relative grid h-7 w-7 place-items-center transition-colors hover:text-[#6B0F1A]"
              onClick={openCart}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
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
