import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { productsApi } from "../../api/products";
import { EmptyState } from "../../components/common/EmptyState";
import { Seo } from "../../components/common/Seo";
import { ProductCard } from "../../components/product/ProductCard";
import { useI18n } from "../../hooks/useI18n";
import { useFavoritesStore } from "../../store/favoritesStore";
import type { Product } from "../../types";

export function FavoritesPage() {
  const { t } = useI18n();
  const favorites = useFavoritesStore((state) => state.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);

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
          setApiLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favorites.some((favorite) => favorite.slug === product.slug)),
    [favorites, products],
  );

  if (favorites.length === 0) {
    return (
      <>
        <Seo title="Favorites | Rüzo" description="Your saved Rüzo favorites." path="/favorites" robots="noindex,nofollow" />
        <EmptyState title={t("emptyFavorites")} actionTo="/collections/sets" />
      </>
    );
  }

  if (apiLoaded && favoriteProducts.length === 0) {
    return (
      <>
        <Seo title="Favorites | Rüzo" description="Your saved Rüzo favorites." path="/favorites" robots="noindex,nofollow" />
        <EmptyState title={t("emptyFavorites")} actionTo="/collections/sets" />
      </>
    );
  }

  return (
    <>
      <Seo title="Favorites | Rüzo" description="Your saved Rüzo favorites." path="/favorites" robots="noindex,nofollow" />
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <div className="mb-10 flex items-end justify-between border-b border-[#ded2c5] pb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-display text-[#8b725f]">{t("ruzoEdit")}</p>
            <h1 className="font-display mt-3 text-5xl">{t("favorites")}</h1>
          </div>
          <Heart className="h-7 w-7 text-[#4B2E24]" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {(favoriteProducts.length > 0 ? favoriteProducts : products.slice(0, 0)).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
