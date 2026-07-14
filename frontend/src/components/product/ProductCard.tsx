import { useState } from "react";
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
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { language, t } = useI18n();
  const [shouldLoadHoverImage, setShouldLoadHoverImage] = useState(false);
  const [hoverImageLoaded, setHoverImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.slug));
  const image = getProductImage(product);
  const hoverImage = getHoverImage(product);
  const hasHoverImage = Boolean(hoverImage && hoverImage !== image);
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
      onMouseEnter={() => {
        if (hasHoverImage) {
          setShouldLoadHoverImage(true);
        }
      }}
      onFocus={() => {
        if (hasHoverImage) {
          setShouldLoadHoverImage(true);
        }
      }}
    >
      <div className="relative overflow-hidden border border-[#080808]/10 bg-[#F7F3F0]">
        <Link to={`/products/${product.slug}`} className="block">
          <img
            src={image}
            alt={getProductName(product, language)}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            width={900}
            height={1200}
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
            className={`product-image aspect-[3/4] w-full object-cover transition duration-700 ${
              hoverImageLoaded ? "group-hover:opacity-0" : ""
            }`}
          />
          {hasHoverImage && shouldLoadHoverImage ? (
            <img
              src={hoverImage}
              alt=""
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              width={900}
              height={1200}
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
              onLoad={() => setHoverImageLoaded(true)}
              className={`product-image absolute inset-0 aspect-[3/4] h-full w-full object-cover opacity-0 transition duration-700 ${
                hoverImageLoaded ? "group-hover:opacity-100" : ""
              }`}
            />
          ) : null}
        </Link>

        {product.badge || product.isNew || product.isBestSeller ? (
          <span className="absolute left-3 top-3 border border-[#080808]/10 bg-[#FFFFFF]/96 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B0F1A]">
            {product.badge ?? (product.isNew ? t("newest") : t("bestSellers"))}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={t("favorites")}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-[#080808]/12 bg-[#FFFFFF]/94 text-[#080808] backdrop-blur transition hover:border-[#6B0F1A] hover:text-[#6B0F1A]"
          onClick={() => toggleFavorite(toFavoriteItem(product))}
        >
          <Heart className={isFavorite ? "h-4 w-4 fill-[#6B0F1A] text-[#6B0F1A]" : "h-4 w-4"} />
        </button>

        <button
          type="button"
          className="absolute inset-x-0 bottom-0 flex min-h-11 translate-y-full items-center justify-center gap-2 bg-[#080808]/92 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFFFFF] transition duration-300 hover:bg-[#6B0F1A] group-hover:translate-y-0"
          onClick={handleQuickAdd}
        >
          <ShoppingBag className="h-4 w-4" />
          {t("quickAdd")}
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              to={`/products/${product.slug}`}
              className="luxury-link-underline block truncate text-sm font-medium text-[#080808]"
            >
              {getProductName(product, language)}
            </Link>
            {product.category ? (
            <p className="mt-1 truncate text-[11px] uppercase tracking-[0.16em] text-[#6B0F1A]">
                {language === "ar" ? product.category.nameAr : product.category.nameEn}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-right text-sm text-[#080808]">
            {product.salePrice ? (
              <p>
                <span className="font-semibold">{formatCurrency(displayPrice, language)}</span>
                <span className="ms-2 text-[#6B0F1A] line-through">
                  {formatCurrency(product.price, language)}
                </span>
              </p>
            ) : (
              <p className="font-semibold">{formatCurrency(product.price, language)}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex min-h-5 items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {colors.map((color) => {
              const variant = product.variants.find((item) => item.color === color);
              return (
                <span
                  key={color}
                  title={color}
                  className="h-3 w-3 rounded-full ring-1 ring-[#080808]/18"
                  style={{ backgroundColor: variant?.colorHex ?? color }}
                />
              );
            })}
          </div>
          {(product.reviewCount ?? 0) > 0 ? (
            <div className="flex items-center gap-1.5">
              <StarRating value={product.avgRating ?? 0} size={12} />
              <span className="text-[11px] text-[#6B0F1A]">({product.reviewCount})</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
