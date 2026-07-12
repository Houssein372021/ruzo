import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { selectCartTotals, useCartStore } from "../../store/cartStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { TopBar } from "./TopBar";

const navItems = [
  { to: "/", key: "home" },
  { to: "/collections/sets", key: "sets" },
  { to: "/collections/sport-bras", key: "sportsBras" },
  { to: "/collections/bottoms", key: "bottoms" },
  { to: "/favorites", key: "favorites" },
  { to: "/about", key: "about" },
  { to: "/contact", key: "contact" },
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
        <>
          <button
            type="button"
            className="px-2 py-1 uppercase tracking-display text-[#111111]/70 transition-colors hover:text-[#4B2E24]"
            onClick={toggleLanguage}
            aria-label={t("switchLanguage")}
          >
            {language === "en" ? "AR" : "EN"}
          </button>
          <Link
            to="/favorites"
            aria-label={t("favorites")}
            className="relative p-2 transition-colors hover:text-[#4B2E24]"
          >
            <Heart className="h-[18px] w-[18px]" />
            {favoriteCount > 0 ? (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4B2E24] px-1 text-[10px] leading-none text-white">
                {favoriteCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={t("cart")}
            className="relative p-2 transition-colors hover:text-[#4B2E24]"
            onClick={openCart}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 ? (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4B2E24] px-1 text-[10px] leading-none text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </>
      }
    />
  );
}
