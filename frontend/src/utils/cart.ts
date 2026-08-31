import type { CartItem, Product } from "../types";
import { getProductImage, toFavoriteItem } from "./product";

export function syncCartItemsWithProducts(items: CartItem[], products: Product[]): CartItem[] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items
    .map((item) => {
      const product = productMap.get(item.id);
      if (!product) {
        return null;
      }

      const variant =
        product.variants.find((candidate) => candidate.id === item.variantId) ??
        product.variants.find((candidate) => candidate.color === item.color && candidate.size === item.size);

      if (!variant || variant.stock <= 0) {
        return null;
      }

      const favoriteItem = toFavoriteItem(product);
      const syncedItem: CartItem = {
        ...item,
        ...favoriteItem,
        variantId: variant.id,
        color: variant.color,
        colorHex: variant.colorHex,
        size: variant.size,
        stock: variant.stock,
        imageUrl: variant.imageUrl ?? item.imageUrl ?? favoriteItem.imageUrl ?? getProductImage(product),
        quantity: Math.min(item.quantity, variant.stock),
      };

      return syncedItem;
    })
    .filter((item): item is CartItem => item !== null && item.quantity > 0);
}

export function hasCartItemSale(item: CartItem) {
  const originalPrice = Number(item.originalPrice ?? 0);
  const salePrice = Number(item.salePrice ?? item.price);
  return Boolean(item.onSale) && originalPrice > 0 && salePrice > 0 && salePrice < originalPrice;
}
