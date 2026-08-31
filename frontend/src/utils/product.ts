import type { FavoriteItem, Language, Product, ProductImage } from "../types";

type ProductPricingSource = Pick<
  Product,
  "price" | "salePrice" | "onSale" | "effectivePrice" | "discountPercentage"
>;

export function getProductName(product: Pick<Product, "nameEn" | "nameAr">, language: Language) {
  return language === "ar" ? product.nameAr : product.nameEn;
}

export function getProductDescription(
  product: Pick<Product, "descriptionEn" | "descriptionAr">,
  language: Language,
) {
  return language === "ar" ? product.descriptionAr : product.descriptionEn;
}

export function getProductImage(product: Product) {
  return getProductImageUrl(product.images[0]) || product.variants[0]?.imageUrl || product.category?.imageUrl || "";
}

export function getHoverImage(product: Product) {
  return getProductImageUrl(product.images[1]) || getProductImage(product);
}

export function getProductImageUrl(image?: ProductImage | null) {
  return image?.imageUrl ?? image?.url ?? "";
}

export function isProductOnSale(product: ProductPricingSource) {
  const originalPrice = Number(product.price ?? 0);
  const salePrice = Number(product.salePrice ?? 0);
  return Boolean(product.onSale) && originalPrice > 0 && salePrice > 0 && salePrice < originalPrice;
}

export function getEffectiveProductPrice(product: ProductPricingSource) {
  const backendEffectivePrice = Number(product.effectivePrice ?? 0);
  if (backendEffectivePrice > 0) {
    return backendEffectivePrice;
  }
  return isProductOnSale(product) ? Number(product.salePrice) : Number(product.price ?? 0);
}

export function getDiscountPercentage(product: ProductPricingSource) {
  if (!isProductOnSale(product)) {
    return null;
  }

  const backendDiscount = Number(product.discountPercentage ?? 0);
  if (Number.isFinite(backendDiscount) && backendDiscount > 0) {
    return Math.round(backendDiscount);
  }

  const originalPrice = Number(product.price ?? 0);
  const salePrice = Number(product.salePrice ?? 0);
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return Number.isFinite(discount) && discount > 0 ? discount : null;
}

export function toFavoriteItem(product: Product): FavoriteItem {
  const discountPercentage = getDiscountPercentage(product);

  return {
    id: product.id,
    slug: product.slug,
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    price: getEffectiveProductPrice(product),
    originalPrice: product.price,
    salePrice: isProductOnSale(product) ? product.salePrice : null,
    onSale: isProductOnSale(product),
    discountPercentage,
    imageUrl: getProductImage(product),
    categorySlug: product.category?.slug,
  };
}

export function uniqueValues(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}
