import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { adminApi } from "../../api/admin";
import { AdminImageUpload } from "../../components/admin/AdminImageUpload";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { useI18n } from "../../hooks/useI18n";
import type { Category } from "../../types";

type CategoryForm = {
  id?: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyCategoryForm: CategoryForm = {
  slug: "",
  nameEn: "",
  nameAr: "",
  imageUrl: "",
  sortOrder: "0",
  isActive: true,
};

export function AdminCategoriesPage() {
  const { language, t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm);
  const [error, setError] = useState("");

  const loadCategories = useCallback(() => {
    adminApi
      .categories()
      .then(setCategories)
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        `${category.nameEn} ${category.nameAr} ${category.slug}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  const handleSave = async () => {
    const payload = {
      slug: form.slug,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      imageUrl: form.imageUrl,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await adminApi.updateCategory(form.id, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      setForm(emptyCategoryForm);
      loadCategories();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteCategory(id);
      loadCategories();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader title={t("categories")} />
      {error ? <p className="admin-notice">{error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminPanel
          title={t("categories")}
          action={
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b725f]" />
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
                <th>{t("categories")}</th>
                <th>{t("slug")}</th>
                <th>{t("status")}</th>
                <th>{t("edit")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={category.imageUrl ?? ""}
                        alt=""
                        className="h-12 w-12 bg-[#e7ded2] object-cover"
                      />
                      <span className="font-semibold">
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </span>
                    </div>
                  </td>
                  <td>{category.slug}</td>
                  <td>{category.isActive === false ? t("inactive") : t("active")}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() =>
                          setForm({
                            id: category.id,
                            slug: category.slug,
                            nameEn: category.nameEn,
                            nameAr: category.nameAr,
                            imageUrl: category.imageUrl ?? "",
                            sortOrder: String(category.sortOrder ?? 0),
                            isActive: category.isActive !== false,
                          })
                        }
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-button"
                        onClick={() => handleDelete(category.id)}
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

        <AdminPanel title={form.id ? t("edit") : t("categories")}>
          <div className="grid gap-3">
            <AdminInput label={t("slug")} value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} />
            <AdminInput label={t("nameEn")} value={form.nameEn} onChange={(value) => setForm({ ...form, nameEn: value })} />
            <AdminInput label={t("nameAr")} value={form.nameAr} onChange={(value) => setForm({ ...form, nameAr: value })} />
            <AdminImageUpload
              label={t("image")}
              value={form.imageUrl}
              onChange={(value) => setForm({ ...form, imageUrl: value })}
            />
            <AdminInput label={t("sortOrder")} value={form.sortOrder} onChange={(value) => setForm({ ...form, sortOrder: value })} />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              />
              {form.isActive ? t("active") : t("inactive")}
            </label>
            <button type="button" className="admin-primary-button" onClick={handleSave}>
              <Plus className="h-4 w-4" />
              {t("save")}
            </button>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

function AdminHeader({ title }: { title: string }) {
  return (
    <div className="admin-page-header">
      <h1 className="admin-page-heading">{title}</h1>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[#8b725f]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
      />
    </label>
  );
}
