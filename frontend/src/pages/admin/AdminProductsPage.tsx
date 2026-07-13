import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { adminApi } from "../../api/admin";
import { AdminImageUpload } from "../../components/admin/AdminImageUpload";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { useI18n } from "../../hooks/useI18n";
import type { Category, Product } from "../../types";
import { formatCurrency } from "../../utils/format";
import { getProductImageUrl } from "../../utils/product";

type ProductImageForm = {
  imageUrl: string;
  sortOrder: string;
};

type ProductVariantForm = {
  color: string;
  colorHex: string;
  size: string;
  stock: string;
  imageUrl: string;
};

type ProductForm = {
  id?: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  descriptionEn: string;
  descriptionAr: string;
  fabricCareEn: string;
  fabricCareAr: string;
  price: string;
  categoryId: string;
  videoUrl: string;
  active: boolean;
  images: ProductImageForm[];
  variants: ProductVariantForm[];
};

const createImageRow = (sortOrder = 1): ProductImageForm => ({
  imageUrl: "",
  sortOrder: String(sortOrder),
});

const createVariantRow = (): ProductVariantForm => ({
  color: "",
  colorHex: "",
  size: "",
  stock: "0",
  imageUrl: "",
});

const createEmptyProductForm = (categoryId = ""): ProductForm => ({
  slug: "",
  nameEn: "",
  nameAr: "",
  shortDescriptionEn: "",
  shortDescriptionAr: "",
  descriptionEn: "",
  descriptionAr: "",
  fabricCareEn: "",
  fabricCareAr: "",
  price: "",
  categoryId,
  videoUrl: "",
  active: true,
  images: [createImageRow()],
  variants: [createVariantRow()],
});

const colorHexByName: Record<string, string> = {
  beige: "#D8C3A5",
  black: "#111111",
  blanc: "#FFFFFF",
  bleu: "#2563EB",
  blue: "#2563EB",
  brown: "#6F4536",
  brun: "#6F4536",
  chocolat: "#4B2E24",
  chocolate: "#4B2E24",
  cream: "#EFE3D2",
  creme: "#EFE3D2",
  "crème": "#EFE3D2",
  gray: "#808080",
  grey: "#808080",
  gris: "#808080",
  green: "#16A34A",
  ivory: "#F5EFE3",
  ivoire: "#F5EFE3",
  jaune: "#EAB308",
  marron: "#6F4536",
  mocha: "#7A5548",
  noir: "#111111",
  nude: "#D6B59E",
  orange: "#F97316",
  pink: "#D88FA1",
  purple: "#7E22CE",
  red: "#DC2626",
  rose: "#D88FA1",
  rouge: "#DC2626",
  sable: "#D8C3A5",
  sand: "#D8C3A5",
  taupe: "#BCA895",
  vert: "#16A34A",
  violet: "#7E22CE",
  white: "#FFFFFF",
  yellow: "#EAB308",
  "أسود": "#111111",
  "أبيض": "#FFFFFF",
  "بيج": "#D8C3A5",
  "عاجي": "#F5EFE3",
  "وردي": "#D88FA1",
  "بني": "#6F4536",
  "رمادي": "#808080",
  "أحمر": "#DC2626",
  "أزرق": "#2563EB",
  "أخضر": "#16A34A",
};

function resolveColorHex(color: string) {
  const normalizedColor = color.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (!normalizedColor) {
    return "";
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalizedColor)) {
    return normalizedColor.toUpperCase();
  }
  const directMatch = colorHexByName[normalizedColor];
  if (directMatch) {
    return directMatch;
  }

  return normalizedColor
    .split(/[\s\-_]+/)
    .map((part) => colorHexByName[part])
    .find(Boolean) ?? "";
}

export function AdminProductsPage() {
  const { language, t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProductForm>(() => createEmptyProductForm());

  const loadProducts = useCallback(() => {
    adminApi
      .products()
      .then(setProducts)
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  const loadCategories = useCallback(() => {
    adminApi
      .categories()
      .then((data) => {
        setCategories(data);
        setForm((current) => (
          current.categoryId || data.length === 0
            ? current
            : { ...current, categoryId: data[0].id }
        ));
      })
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadCategories, loadProducts]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryName = product.category
          ? `${product.category.nameEn} ${product.category.nameAr}`
          : "";
        return `${product.nameEn} ${product.nameAr} ${product.slug} ${categoryName}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [products, search],
  );

  const handleSave = async () => {
    setError("");
    const categoryId = form.categoryId || categories[0]?.id;
    if (!categoryId) {
      setError(t("required"));
      return;
    }

    const images = form.images
      .map((image, index) => ({
        imageUrl: image.imageUrl.trim(),
        sortOrder: Number(image.sortOrder || index + 1),
      }))
      .filter((image) => image.imageUrl);

    const variants = form.variants
      .map((variant) => ({
        color: variant.color.trim(),
        colorHex: variant.colorHex.trim() || undefined,
        size: variant.size.trim(),
        stock: Number(variant.stock || 0),
        imageUrl: variant.imageUrl.trim() || undefined,
      }))
      .filter((variant) => variant.color || variant.size || variant.imageUrl || variant.stock > 0);

    const payload = {
      slug: form.slug.trim(),
      nameEn: form.nameEn.trim(),
      nameAr: form.nameAr.trim(),
      shortDescriptionEn: form.shortDescriptionEn.trim(),
      shortDescriptionAr: form.shortDescriptionAr.trim(),
      descriptionEn: form.descriptionEn.trim(),
      descriptionAr: form.descriptionAr.trim(),
      fabricCareEn: form.fabricCareEn.trim(),
      fabricCareAr: form.fabricCareAr.trim(),
      price: Number(form.price || 0),
      categoryId,
      videoUrl: form.videoUrl.trim() || undefined,
      active: form.active,
      images,
      variants,
    };

    try {
      if (form.id) {
        await adminApi.updateProduct(form.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setForm(createEmptyProductForm(categoryId));
      loadProducts();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteProduct(id);
      loadProducts();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      id: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      shortDescriptionEn: product.shortDescriptionEn ?? "",
      shortDescriptionAr: product.shortDescriptionAr ?? "",
      descriptionEn: product.descriptionEn ?? "",
      descriptionAr: product.descriptionAr ?? "",
      fabricCareEn: product.fabricCareEn ?? "",
      fabricCareAr: product.fabricCareAr ?? "",
      price: String(product.price),
      categoryId: product.category?.id ?? categories[0]?.id ?? "",
      videoUrl: product.videoUrl ?? "",
      active: product.active ?? product.isActive ?? true,
      images: product.images.length
        ? product.images.map((image, index) => ({
            imageUrl: getProductImageUrl(image),
            sortOrder: String(image.sortOrder ?? index + 1),
          }))
        : [createImageRow()],
      variants: product.variants.length
        ? product.variants.map((variant) => ({
            color: variant.color ?? "",
            colorHex: variant.colorHex ?? "",
            size: variant.size ?? "",
            stock: String(variant.stock ?? 0),
            imageUrl: variant.imageUrl ?? "",
          }))
        : [createVariantRow()],
    });
  };

  const updateImage = (index: number, patch: Partial<ProductImageForm>) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => (
        imageIndex === index ? { ...image, ...patch } : image
      )),
    }));
  };

  const addImage = () => {
    setForm((current) => ({
      ...current,
      images: [...current.images, createImageRow(current.images.length + 1)],
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const updateVariant = (index: number, patch: Partial<ProductVariantForm>) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (
        variantIndex === index ? { ...variant, ...patch } : variant
      )),
    }));
  };

  const updateVariantColor = (index: number, color: string) => {
    const resolvedHex = resolveColorHex(color);
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (
        variantIndex === index
          ? {
              ...variant,
              color,
              colorHex: resolvedHex || variant.colorHex,
            }
          : variant
      )),
    }));
  };

  const addVariant = () => {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, createVariantRow()],
    }));
  };

  const removeVariant = (index: number) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(createEmptyProductForm(form.categoryId || categories[0]?.id || ""));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("products")} />
      {error ? <p className="admin-notice">{error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <AdminPanel
          title={t("products")}
          action={
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A2638]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("search")}
                className="admin-search-input"
              />
            </label>
          }
        >
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("products")}</th>
                <th>{t("category")}</th>
                <th>{t("price")}</th>
                <th>{t("stock")}</th>
                <th>{t("edit")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="font-semibold">{language === "ar" ? product.nameAr : product.nameEn}</div>
                    <div className="text-xs text-[#8A2638]">{product.slug}</div>
                  </td>
                  <td>
                    {product.category
                      ? language === "ar"
                        ? product.category.nameAr
                        : product.category.nameEn
                      : "-"}
                  </td>
                  <td>{formatCurrency(product.price, language)}</td>
                  <td>{product.variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanel>

        <AdminPanel title={form.id ? t("edit") : t("addProduct")}>
          <div className="grid gap-3">
            <AdminSelect
              label={t("category")}
              value={form.categoryId}
              onChange={(value) => setForm({ ...form, categoryId: value })}
            >
              <option value="">{t("category")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {language === "ar" ? category.nameAr : category.nameEn}
                </option>
              ))}
            </AdminSelect>
            <AdminInput label={t("slug")} value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} />
            <AdminInput label={t("nameEn")} value={form.nameEn} onChange={(value) => setForm({ ...form, nameEn: value })} />
            <AdminInput label={t("nameAr")} value={form.nameAr} onChange={(value) => setForm({ ...form, nameAr: value })} />
            <AdminTextarea
              label={t("shortDescriptionEn")}
              value={form.shortDescriptionEn}
              onChange={(value) => setForm({ ...form, shortDescriptionEn: value })}
            />
            <AdminTextarea
              label={t("shortDescriptionAr")}
              value={form.shortDescriptionAr}
              onChange={(value) => setForm({ ...form, shortDescriptionAr: value })}
            />
            <AdminTextarea
              label={t("descriptionEn")}
              value={form.descriptionEn}
              onChange={(value) => setForm({ ...form, descriptionEn: value })}
            />
            <AdminTextarea
              label={t("descriptionAr")}
              value={form.descriptionAr}
              onChange={(value) => setForm({ ...form, descriptionAr: value })}
            />
            <AdminTextarea
              label={t("fabricCareEn")}
              value={form.fabricCareEn}
              onChange={(value) => setForm({ ...form, fabricCareEn: value })}
            />
            <AdminTextarea
              label={t("fabricCareAr")}
              value={form.fabricCareAr}
              onChange={(value) => setForm({ ...form, fabricCareAr: value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <AdminInput label={t("price")} type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
              <AdminInput label={t("videoUrl")} value={form.videoUrl} onChange={(value) => setForm({ ...form, videoUrl: value })} />
            </div>

            <FormSection title={t("productImages")} actionLabel={t("addImage")} onAdd={addImage}>
              {form.images.map((image, index) => (
                <div key={`${index}-${image.sortOrder}`} className="grid gap-3 border border-[#E6D9DE] p-3">
                  <div className="grid grid-cols-[1fr_40px] gap-2">
                    <AdminInput
                      label={t("sortOrder")}
                      type="number"
                      value={image.sortOrder}
                      onChange={(value) => updateImage(index, { sortOrder: value })}
                    />
                    <button
                      type="button"
                      aria-label={t("remove")}
                      className="admin-icon-button mt-6"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <AdminImageUpload
                    label={t("imageUrl")}
                    value={image.imageUrl}
                    onChange={(value) => updateImage(index, { imageUrl: value })}
                  />
                </div>
              ))}
            </FormSection>

            <FormSection title={t("variants")} actionLabel={t("addVariant")} onAdd={addVariant}>
              {form.variants.map((variant, index) => (
                <div key={index} className="grid gap-3 border border-[#E6D9DE] p-3">
                  <div className="grid grid-cols-[1fr_1fr_40px] gap-2">
                    <AdminInput
                      label={t("variantColor")}
                      value={variant.color}
                      onChange={(value) => updateVariantColor(index, value)}
                    />
                    <AdminInput
                      label={t("colorHex")}
                      value={variant.colorHex}
                      onChange={(value) => updateVariant(index, { colorHex: value })}
                    />
                    <button
                      type="button"
                      aria-label={t("remove")}
                      className="admin-icon-button mt-6"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminInput
                      label={t("size")}
                      value={variant.size}
                      onChange={(value) => updateVariant(index, { size: value })}
                    />
                    <AdminInput
                      label={t("stock")}
                      type="number"
                      value={variant.stock}
                      onChange={(value) => updateVariant(index, { stock: value })}
                    />
                  </div>
                  <AdminImageUpload
                    label={t("imageUrl")}
                    value={variant.imageUrl}
                    onChange={(value) => updateVariant(index, { imageUrl: value })}
                  />
                </div>
              ))}
            </FormSection>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
              />
              {form.active ? t("active") : t("inactive")}
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" className="admin-primary-button" onClick={handleSave}>
                <Plus className="h-4 w-4" />
                {t("save")}
              </button>
              {form.id ? (
                <button type="button" className="admin-secondary-button" onClick={resetForm}>
                  <X className="h-4 w-4" />
                  {t("cancel")}
                </button>
              ) : null}
            </div>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

type AdminPageHeaderProps = {
  title: string;
};

function AdminPageHeader({ title }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <h1 className="admin-page-heading">{title}</h1>
    </div>
  );
}

type AdminInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

function AdminInput({ label, value, onChange, type = "text" }: AdminInputProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A2638]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange }: AdminInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A2638]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input min-h-24 py-3"
      />
    </label>
  );
}

function AdminSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8A2638]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-select w-full"
      >
        {children}
      </select>
    </label>
  );
}

function FormSection({
  title,
  actionLabel,
  onAdd,
  children,
}: {
  title: string;
  actionLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3 border-t border-[#E6D9DE] pt-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#080808]">{title}</h3>
        <button type="button" className="admin-secondary-button" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
      {children}
    </section>
  );
}
