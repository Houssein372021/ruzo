import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import { useCartStore } from "../../store/cartStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import { formatCurrency } from "../../utils/format";
import { getHoverImage, getProductImage, getProductName, toFavoriteItem, uniqueValues } from "../../utils/product";
import { StarRating } from "./StarRating";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useI18n();
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.slug));
  const image = getProductImage(product);
  const hoverImage = getHoverImage(product);
  const colors = uniqueValues(product.variants.map((variant) => variant.color)).slice(0, 5);
  const firstVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const displayPrice = product.salePrice ?? product.price;

  const handleQuickAdd = () => {
    addItem({
      ...toFavoriteItem(product),
      variantId: firstVariant?.id,
      color: firstVariant?.color,
      colorHex: firstVariant?.colorHex,
      size: firstVariant?.size,
      imageUrl: firstVariant?.imageUrl ?? toFavoriteItem(product).imageUrl,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className="group relative"
    >
      <div className="relative overflow-hidden bg-[#e7ded2]">
        <Link to={`/products/${product.slug}`} className="block">
          <img
            src={image}
            alt={getProductName(product, language)}
            loading="lazy"
            className="product-image aspect-[3/4] w-full object-cover transition duration-700 group-hover:opacity-0"
          />
          <img
            src={hoverImage}
            alt=""
            loading="lazy"
            className="product-image absolute inset-0 aspect-[3/4] h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100"
          />
        </Link>
        {product.badge || product.isNew || product.isBestSeller ? (
          <span className="absolute left-3 top-3 bg-[#F8F4EC]/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-display text-[#4B2E24]">
            {product.badge ?? (product.isNew ? t("newest") : t("bestSellers"))}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={t("favorites")}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-[#F8F4EC]/90 shadow-sm backdrop-blur transition hover:bg-white"
          onClick={() => toggleFavorite(toFavoriteItem(product))}
        >
          <Heart className={isFavorite ? "h-5 w-5 fill-[#4B2E24] text-[#4B2E24]" : "h-5 w-5"} />
        </button>
        <button
          type="button"
          className="absolute bottom-3 left-3 right-3 flex h-11 translate-y-2 items-center justify-center gap-2 bg-[#4B2E24] text-xs font-semibold uppercase tracking-[0.18em] text-[#F8F4EC] opacity-0 transition hover:bg-[#3a2118] group-hover:translate-y-0 group-hover:opacity-100"
          onClick={handleQuickAdd}
        >
          <ShoppingBag className="h-4 w-4" />
          {t("quickAdd")}
        </button>
      </div>
      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/products/${product.slug}`} className="luxury-link-underline block truncate text-sm text-[#111111]">
            {getProductName(product, language)}
          </Link>
          <div className="text-right text-sm text-[#111111]">
            {product.salePrice ? (
              <p>
                <span className="font-semibold">{formatCurrency(displayPrice, language)}</span>
                <span className="ms-2 text-[#8b725f] line-through">
                  {formatCurrency(product.price, language)}
                </span>
              </p>
            ) : (
              <p className="font-semibold">{formatCurrency(product.price, language)}</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {colors.map((color) => {
              const variant = product.variants.find((item) => item.color === color);
              return (
                <span
                  key={color}
                  title={color}
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-[#d8cbbd]"
                  style={{ backgroundColor: variant?.colorHex ?? color }}
                />
              );
            })}
          </div>
          {(product.reviewCount ?? 0) > 0 ? (
            <div className="flex items-center gap-1.5">
              <StarRating value={product.avgRating ?? 0} size={12} />
              <span className="text-[11px] text-[#8b725f]">({product.reviewCount})</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
