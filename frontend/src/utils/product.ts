import type { FavoriteItem, Language, Product, ProductImage } from "../types";

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

export function toFavoriteItem(product: Product): FavoriteItem {
  return {
    id: product.id,
    slug: product.slug,
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    price: product.salePrice ?? product.price,
    imageUrl: getProductImage(product),
    categorySlug: product.category?.slug,
  };
}

export function uniqueValues(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}
