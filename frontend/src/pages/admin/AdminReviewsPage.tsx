import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Search, Trash2, X } from "lucide-react";
import { reviewsApi } from "../../api/reviews";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { StarRating } from "../../components/product/StarRating";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n/translations";
import type { AdminReview, ReviewStatus } from "../../types";

const statuses: Array<ReviewStatus | "ALL"> = ["ALL", "PENDING", "APPROVED", "REJECTED"];
const reviewStatusTranslationKeys: Record<ReviewStatus, TranslationKey> = {
  PENDING: "reviewStatusPending",
  APPROVED: "reviewStatusApproved",
  REJECTED: "reviewStatusRejected",
};

export function AdminReviewsPage() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReviewStatus | "ALL">("PENDING");
  const [error, setError] = useState("");

  const loadReviews = useCallback(() => {
    reviewsApi
      .getAdminReviews()
      .then(setReviews)
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const haystack = `${review.productName} ${review.orderNumber} ${review.customerName}`.toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesStatus = status === "ALL" || review.status === status;
        return matchesSearch && matchesStatus;
      }),
    [reviews, search, status],
  );

  const updateStatus = async (id: string, nextStatus: ReviewStatus) => {
    try {
      await reviewsApi.updateStatus(id, nextStatus);
      loadReviews();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await reviewsApi.delete(id);
      loadReviews();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-heading">{t("reviews")}</h1>
      </div>
      {error ? <p className="admin-notice">{error}</p> : null}
      <AdminPanel
        title={t("reviews")}
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b725f]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("search")}
                className="admin-search-input"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ReviewStatus | "ALL")}
              className="admin-select"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? t("all") : t(reviewStatusTranslationKeys[item])}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("products")}</th>
              <th>{t("customers")}</th>
              <th>{t("rating")}</th>
              <th>{t("status")}</th>
              <th>{t("details")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <p className="font-semibold">{review.productName}</p>
                  <p className="mt-1 text-xs text-[#8b725f]">{review.orderNumber}</p>
                </td>
                <td>
                  <p>{review.customerName}</p>
                  <p className="mt-1 text-xs text-[#8b725f]">{review.customerEmail}</p>
                </td>
                <td>
                  <StarRating value={review.rating} />
                </td>
                <td>{review.status ? t(reviewStatusTranslationKeys[review.status]) : "-"}</td>
                <td className="min-w-72">
                  {review.title ? <p className="font-semibold">{review.title}</p> : null}
                  <p className="mt-1 text-sm leading-6 text-[#6d6258]">{review.body}</p>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => updateStatus(review.id, "APPROVED")}
                      title={t("approve")}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => updateStatus(review.id, "REJECTED")}
                      title={t("reject")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-button"
                      onClick={() => deleteReview(review.id)}
                      title={t("delete")}
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
    </div>
  );
}
