import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { productsApi } from "../../api/products";
import { EmptyState } from "../../components/common/EmptyState";
import { ProductSkeletonGrid } from "../../components/common/Skeleton";
import { Seo } from "../../components/common/Seo";
import { QuantityStepper } from "../../components/common/QuantityStepper";
import { ProductCard } from "../../components/product/ProductCard";
import { ReviewsSection } from "../../components/product/ReviewsSection";
import { StarRating } from "../../components/product/StarRating";
import { useI18n } from "../../hooks/useI18n";
import { useCartStore } from "../../store/cartStore";
import { useFavoritesStore } from "../../store/favoritesStore";
import type { Product, ProductVariant } from "../../types";
import { formatCurrency } from "../../utils/format";
import {
  getProductDescription,
  getProductImage,
  getProductImageUrl,
  getProductName,
  toFavoriteItem,
  uniqueValues,
} from "../../utils/product";

export function ProductDetailPage() {
  const { slug } = useParams();
  const { language, t } = useI18n();
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(slug ?? ""));
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const mediaRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!slug) {
      return;
    }

    let isMounted = true;
    Promise.all([productsApi.getBySlug(slug), productsApi.getAll()])
      .then(([productData, productsData]) => {
        if (!isMounted) {
          return;
        }

        const firstVariant = productData.variants.find((variant) => variant.stock > 0) ?? productData.variants[0];
        setProduct(productData);
        setAllProducts(productsData);
        setSelectedImage(firstVariant?.imageUrl || getProductImage(productData));
        setSelectedColor(firstVariant?.color ?? "");
        setSelectedSize(firstVariant?.size ?? "");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const colors = useMemo(
    () => uniqueValues(product?.variants.map((variant) => variant.color) ?? []),
    [product],
  );

  const sizes = useMemo(
    () =>
      uniqueValues(
        product?.variants
          .filter((variant) => (!selectedColor || variant.color === selectedColor) && variant.stock > 0)
          .map((variant) => variant.size) ?? [],
      ),
    [product, selectedColor],
  );

  const selectedVariant = useMemo<ProductVariant | undefined>(
    () =>
      product?.variants.find(
        (variant) => variant.color === selectedColor && variant.size === selectedSize,
      ),
    [product, selectedColor, selectedSize],
  );

  const similarProducts = useMemo(
    () =>
      allProducts
        .filter((item) => item.category?.slug === product?.category?.slug && item.slug !== product?.slug)
        .slice(0, 4),
    [allProducts, product],
  );

  const mediaImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const seen = new Set<string>();
    const images: Array<{ id: string; imageUrl: string }> = [];
    const addImage = (id: string, imageUrl?: string | null) => {
      if (!imageUrl || seen.has(imageUrl)) {
        return;
      }
      seen.add(imageUrl);
      images.push({ id, imageUrl });
    };

    product.images.forEach((image) => addImage(image.id, getProductImageUrl(image)));
    product.variants.forEach((variant) => addImage(`variant-${variant.id}`, variant.imageUrl));
    return images;
  }, [product]);

  const scrollToMedia = (url?: string | null) => {
    if (!url) {
      return;
    }

    setSelectedImage(url);
    window.setTimeout(() => {
      mediaRefs.current[url]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }, 0);
  };

  if (isLoading) {
    return (
      <>
        <Seo
          title="Rüzo Product | Feminine Activewear"
          description="Shop RÜZO activewear at rüzo: sport bras, sets, and leggings."
          path={`/products/${slug ?? ""}`}
        />
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ProductSkeletonGrid />
        </section>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Seo
          title="Product not found | Rüzo"
          description="This Rüzo product is not available."
          path={`/products/${slug ?? ""}`}
          robots="noindex,nofollow"
        />
        <EmptyState title={t("noProducts")} actionTo="/collections/sets" />
      </>
    );
  }

  const favoriteItem = toFavoriteItem(product);
  const description = getProductDescription(product, language);
  const shortDescription =
    (language === "ar" ? product.shortDescriptionAr : product.shortDescriptionEn)?.trim() || description;
  const displayPrice = product.salePrice ?? product.price;
  const productName = getProductName(product, language);
  const fabricCareCopy =
    (language === "ar" ? product.fabricCareAr : product.fabricCareEn)?.trim() || t("fabricCareCopy");
  const mobileMediaItems = [
    ...mediaImages.map((image) => ({
      id: image.id,
      type: "image" as const,
      url: image.imageUrl,
    })),
    ...(product.videoUrl
      ? [
          {
            id: "product-video",
            type: "video" as const,
            url: product.videoUrl,
          },
        ]
      : []),
  ];
  const selectedMobileMediaIndex = mobileMediaItems.findIndex((item) => item.url === selectedImage);
  const activeMobileMediaIndex = selectedMobileMediaIndex >= 0 ? selectedMobileMediaIndex : 0;
  const activeMobileMedia = mobileMediaItems[activeMobileMediaIndex];
  const productImage = getProductImage(product);
  const productImageUrl = productImage
    ? new URL(productImage, "https://www.rüzo.com").toString()
    : "https://www.rüzo.com/site-icon-512.png";
  const productDescription =
    description || "Sculpted Rüzo activewear with a refined everyday finish.";

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      return;
    }

    addItem(
      {
        ...favoriteItem,
        variantId: selectedVariant?.id,
        color: selectedVariant?.color,
        colorHex: selectedVariant?.colorHex,
        size: selectedVariant?.size,
        imageUrl: selectedVariant?.imageUrl ?? favoriteItem.imageUrl,
      },
      quantity,
    );
  };

  const goToMobileImage = (direction: -1 | 1) => {
    if (mobileMediaItems.length === 0) {
      return;
    }

    const nextIndex =
      (activeMobileMediaIndex + direction + mobileMediaItems.length) % mobileMediaItems.length;
    setSelectedImage(mobileMediaItems[nextIndex].url);
  };

  return (
    <>
      <Seo
        title={`${productName} | RÜZO`}
        description={`${productName} by RÜZO at rüzo. ${productDescription}`}
        path={`/products/${product.slug}`}
        image={productImage}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: productName,
              image: productImageUrl,
              description: productDescription,
              sku: product.slug,
              brand: {
                "@type": "Brand",
                name: "RÜZO",
              },
              offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: displayPrice,
                availability: product.variants.some((variant) => variant.stock > 0)
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                url: `https://www.rüzo.com/products/${product.slug}`,
                seller: {
                  "@type": "Organization",
                  name: "RÜZO",
                },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.rüzo.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: product.category?.nameEn ?? "Products",
                  item: `https://www.rüzo.com/collections/${product.category?.slug ?? "sets"}`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: productName,
                  item: `https://www.rüzo.com/products/${product.slug}`,
                },
              ],
            },
          ],
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 overflow-hidden lg:hidden">
          <div className="mx-auto max-w-full overflow-hidden bg-[#f2eee7] px-4 py-5">
            <div className="relative mx-auto max-w-[360px] overflow-hidden">
              {activeMobileMedia?.type === "image" ? (
                <img
                  src={activeMobileMedia.url}
                  alt={getProductName(product, language)}
                  className="mx-auto aspect-[3/4] max-h-[520px] w-full object-contain"
                />
              ) : activeMobileMedia?.type === "video" ? (
                <video
                  src={activeMobileMedia.url}
                  controls
                  playsInline
                  className="mx-auto aspect-[3/4] max-h-[520px] w-full bg-[#111111] object-contain"
                />
              ) : null}
              {mobileMediaItems.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label={t("previousImage")}
                    onClick={() => goToMobileImage(-1)}
                    className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#6d6258]/85 text-white shadow-sm transition hover:bg-[#4b2e24]"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label={t("nextImage")}
                    onClick={() => goToMobileImage(1)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#6d6258]/85 text-white shadow-sm transition hover:bg-[#4b2e24]"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            {mobileMediaItems.length > 1 ? (
              <div className="mt-6 grid grid-cols-5 gap-2 min-[390px]:grid-cols-6">
                {mobileMediaItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`aspect-square min-w-0 border bg-[#e7ded2] p-0.5 transition ${
                      selectedImage === item.url ? "border-[#111111]" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(item.url)}
                  >
                    {item.type === "image" ? (
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center bg-[#4B2E24] text-[10px] font-semibold uppercase tracking-display text-[#F8F4EC]">
                        {t("video")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[92px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:block lg:space-y-3">
            {mediaImages.map((image) => (
              <button
                key={image.id}
                type="button"
                className={`w-20 shrink-0 border bg-[#e7ded2] ${
                  selectedImage === image.imageUrl ? "border-[#111111]" : "border-transparent"
                }`}
                onClick={() => scrollToMedia(image.imageUrl)}
              >
                <img src={image.imageUrl} alt="" className="aspect-[3/4] w-full object-cover" />
              </button>
            ))}
            {product.videoUrl ? (
              <button
                type="button"
                className={`w-20 shrink-0 border bg-[#4B2E24] text-[10px] font-semibold uppercase tracking-display text-[#F8F4EC] ${
                  selectedImage === product.videoUrl ? "border-[#4B2E24]" : "border-transparent"
                }`}
                onClick={() => scrollToMedia(product.videoUrl)}
              >
                {t("video")}
              </button>
            ) : null}
          </div>
          <div className="order-1 max-h-[calc(100vh-8rem)] snap-y snap-mandatory space-y-4 overflow-y-auto scroll-smooth lg:order-2">
            {mediaImages.map((image) => (
              <motion.div
                key={image.id}
                ref={(node) => {
                  mediaRefs.current[image.imageUrl] = node;
                }}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className={`snap-start overflow-hidden bg-[#e7ded2] ring-1 transition ${
                  selectedImage === image.imageUrl ? "ring-[#4B2E24]" : "ring-transparent"
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={getProductName(product, language)}
                  className="aspect-[3/4] w-full object-cover"
                />
              </motion.div>
            ))}
            {product.videoUrl ? (
              <motion.div
                ref={(node) => {
                  if (product.videoUrl) {
                    mediaRefs.current[product.videoUrl] = node;
                  }
                }}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className={`snap-start overflow-hidden bg-[#111111] ring-1 transition ${
                  selectedImage === product.videoUrl ? "ring-[#4B2E24]" : "ring-transparent"
                }`}
              >
                <video
                  src={product.videoUrl}
                  muted
                  loop
                  playsInline
                  controls
                  className="aspect-[3/4] w-full object-cover"
                />
              </motion.div>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b725f]">
            {product.category ? (language === "ar" ? product.category.nameAr : product.category.nameEn) : "Rüzo"}
          </p>
          <div className="mt-3">
            <h1 className="font-display text-4xl leading-tight text-[#111111] sm:text-5xl">
              {getProductName(product, language)}
            </h1>
          </div>
          {(product.reviewCount ?? 0) > 0 ? (
            <div className="mt-4 flex items-center gap-2">
              <StarRating value={product.avgRating ?? 0} />
              <span className="text-xs text-[#8b725f]">
                {t("basedOnReviews", { count: String(product.reviewCount ?? 0) })}
              </span>
            </div>
          ) : null}
          <div className="mt-3 flex items-baseline gap-3 text-2xl">
            <span className="font-semibold">{formatCurrency(displayPrice, language)}</span>
            {product.salePrice ? (
              <span className="text-base text-[#8b725f] line-through">
                {formatCurrency(product.price, language)}
              </span>
            ) : null}
          </div>
          {shortDescription ? <p className="mt-5 text-sm leading-8 text-[#6d6258]">{shortDescription}</p> : null}

          <div className="mt-9 space-y-7">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111]">
                {t("color")}:{" "}
                {selectedColor ? (
                  <span className="font-medium tracking-[0.18em] text-[#8b725f]">
                    {selectedColor.toUpperCase()}
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((color) => {
                  const variant = product.variants.find((item) => item.color === color);
                  return (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      aria-label={t("colorOption", { color })}
                      className={`h-10 w-10 rounded-full border border-[#d8cbbd] ring-1 transition ${
                        selectedColor === color
                          ? "ring-[#4B2E24] ring-offset-2 ring-offset-[#F8F4EC]"
                          : "ring-transparent hover:ring-[#4B2E24]"
                      }`}
                      style={{ backgroundColor: variant?.colorHex ?? color }}
                      onClick={() => {
                        const firstAvailableVariant =
                          product.variants.find((item) => item.color === color && item.stock > 0) ??
                          product.variants.find((item) => item.color === color);
                        setSelectedColor(color);
                        setSelectedSize(firstAvailableVariant?.size ?? "");
                        scrollToMedia(firstAvailableVariant?.imageUrl ?? variant?.imageUrl ?? selectedImage);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111]">
                {t("size")}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sizeOption) => (
                  <button
                    key={sizeOption}
                    type="button"
                    className={`h-11 min-w-11 border px-5 text-sm transition ${
                      selectedSize === sizeOption
                        ? "border-[#4B2E24] bg-[#4B2E24] text-[#F8F4EC]"
                        : "border-[#d8cbbd] hover:border-[#4B2E24]"
                    }`}
                    onClick={() => setSelectedSize(sizeOption)}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
              {selectedVariant ? (
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-[#8b725f]">
                  {t("stock")}: {selectedVariant.stock}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)_52px] items-center gap-3 pt-1">
              <QuantityStepper value={quantity} variant="product" onChange={setQuantity} />
              <button
                type="button"
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="flex h-[52px] min-w-0 items-center justify-center bg-[#4B2E24] px-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#F8F4EC] transition hover:bg-[#3a2118] max-[420px]:px-2 max-[420px]:text-[0.64rem] max-[420px]:tracking-[0.08em]"
                onClick={handleAddToCart}
              >
                {t("addToCart")}
              </button>
              <button
                type="button"
                aria-label={t("favorites")}
                className="grid h-[52px] w-[52px] place-items-center border border-[#d8cbbd] bg-transparent text-[#111111] transition hover:border-[#4B2E24] hover:text-[#4B2E24]"
                onClick={() => toggleFavorite(favoriteItem)}
              >
                <Heart className={isFavorite ? "h-5 w-5 fill-[#4B2E24] text-[#4B2E24]" : "h-5 w-5"} />
              </button>
            </div>
          </div>

          <div className="mt-10 divide-y divide-[#ded2c5] border-y border-[#ded2c5]">
            {[
              { id: "details", label: t("details"), copy: description || t("productDetailsFallback") },
              { id: "fabric", label: t("fabricCare"), copy: fabricCareCopy },
              { id: "shipping", label: t("shippingReturns"), copy: t("shippingReturnsCopy") },
            ].map((item) => (
              <div key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-xs font-medium uppercase tracking-[0.24em] text-[#3f3128]"
                  onClick={() => setOpenAccordion(openAccordion === item.id ? "" : item.id)}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-4 w-4 transition ${openAccordion === item.id ? "rotate-180" : ""}`}
                  />
                </button>
                {openAccordion === item.id ? (
                  <p className="pb-5 text-sm leading-7 text-[#6d6258]">{item.copy}</p>
                ) : null}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {similarProducts.length > 0 ? (
        <section className="py-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl">{t("similarProducts")}</h2>
            <Link
              to={`/collections/${product.category?.slug ?? "sets"}`}
              className="text-sm font-semibold uppercase tracking-[0.18em]"
            >
              {t("shopNow")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

        <ReviewsSection productId={product.id} />
      </div>
    </>
  );
}
