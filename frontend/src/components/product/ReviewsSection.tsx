import { useEffect, useMemo, useState } from "react";
import { reviewsApi } from "../../api/reviews";
import { useI18n } from "../../hooks/useI18n";
import type { Review } from "../../types";
import { StarRating } from "./StarRating";

type ReviewsSectionProps = {
  productId: string;
};

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    reviewsApi
      .getForProduct(productId)
      .then((data) => {
        if (isMounted) {
          setReviews(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsUnavailable(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const summary = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return { average: total / reviews.length, count: reviews.length };
  }, [reviews]);

  return (
    <section className="border-t border-[#ded2c5] py-16">
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <div>
          <h2 className="font-display text-3xl">{t("reviews")}</h2>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-5xl">{summary.average.toFixed(1)}</span>
            <span className="text-xs font-semibold uppercase tracking-display text-[#8b725f]">/ 5</span>
          </div>
          <StarRating value={summary.average} size={18} className="mt-2" />
          <p className="mt-2 text-xs text-[#6d6258]">
            {t("basedOnReviews", { count: String(summary.count) })}
          </p>
          <p className="mt-6 text-sm leading-6 text-[#6d6258]">{t("verifiedReviewNotice")}</p>
        </div>

        <div>
          {isUnavailable ? <p className="mb-5 bg-white px-4 py-3 text-sm text-[#6d6258]">{t("apiUnavailable")}</p> : null}
          {reviews.length === 0 ? (
            <p className="text-sm text-[#6d6258]">{t("noReviews")}</p>
          ) : (
            <ul className="divide-y divide-[#ded2c5]">
              {reviews.map((review) => (
                <li key={review.id} className="py-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <StarRating value={review.rating} />
                      <span className="text-sm font-semibold">{review.customerName}</span>
                      {review.verifiedPurchase ? (
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8b725f]">
                          {t("verifiedPurchase")}
                        </span>
                      ) : null}
                    </div>
                    {review.createdAt ? (
                      <time className="text-xs text-[#8b725f]">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    ) : null}
                  </div>
                  {review.title ? <p className="mt-3 text-sm font-semibold">{review.title}</p> : null}
                  <p className="mt-2 text-sm leading-7 text-[#6d6258]">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
