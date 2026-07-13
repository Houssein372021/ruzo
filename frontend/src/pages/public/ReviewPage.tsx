import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { reviewsApi } from "../../api/reviews";
import { Seo } from "../../components/common/Seo";
import { InteractiveStars } from "../../components/product/StarRating";
import { useI18n } from "../../hooks/useI18n";
import type { ReviewInvitation, ReviewInvitationProduct } from "../../types";

export function ReviewPage() {
  const { token = "" } = useParams();
  const { t } = useI18n();
  const [invitation, setInvitation] = useState<ReviewInvitation | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    reviewsApi
      .getInvitation(token)
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setInvitation(data);
        setSelectedProductId(data.products[0]?.productId ?? "");
      })
      .catch(() => {
        if (isMounted) {
          setMessage(t("reviewLinkInvalid"));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, t]);

  const selectedProduct = invitation?.products.find((product) => product.productId === selectedProductId);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProductId) {
      return;
    }
    setMessage("");
    setIsSubmitting(true);
    try {
      await reviewsApi.createVerified(token, {
        productId: selectedProductId,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      setMessage(t("reviewPendingApproval"));
      setTitle("");
      setBody("");
      setRating(5);
    } catch {
      setMessage(t("reviewSubmitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
      <Seo
        title="Review | RÜZO"
        description="Share a verified RÜZO purchase review."
        path="/review"
        robots="noindex,nofollow"
      />
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-display text-[#6B0F1A]">RÜZO</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">{t("writeReview")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#080808]/66">{t("reviewPageIntro")}</p>
      </div>

      {isLoading ? <p className="mt-8 text-sm text-[#080808]/66">{t("loading")}</p> : null}
      {message ? (
        <p className="mx-auto mt-6 max-w-3xl border border-[#080808]/10 bg-white px-4 py-3 text-sm text-[#080808]/66">
          {message}
        </p>
      ) : null}

      {invitation && !invitation.reviewOpen ? (
        <div className="mx-auto mt-8 max-w-3xl border border-[#080808]/10 bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl">{invitation.orderNumber}</h2>
          <p className="mt-3 text-sm leading-7 text-[#080808]/66">{t("reviewAfterDelivery")}</p>
          <Link
            to="/"
            className="mt-6 inline-flex bg-[#6B0F1A] px-5 py-3 text-xs font-semibold uppercase tracking-display text-[#FFFFFF] transition hover:bg-[#080808]"
          >
            {t("home")}
          </Link>
        </div>
      ) : null}

      {invitation?.reviewOpen ? (
        <form className="mx-auto mt-8 grid max-w-3xl gap-7 border border-[#080808]/10 bg-white p-5 sm:p-8" onSubmit={handleSubmit}>
          <div className="border-b border-[#080808]/10 pb-5">
            <p className="text-xs font-semibold uppercase tracking-display text-[#6B0F1A]">{invitation.orderNumber}</p>
            <h2 className="mt-2 font-display text-3xl">{selectedProduct?.productName ?? t("products")}</h2>
            <p className="mt-3 text-sm leading-6 text-[#080808]/66">{t("reviewApprovalNotice")}</p>
          </div>

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-display text-[#6B0F1A]">{t("products")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {invitation.products.map((product) => (
                <ProductChoice
                  key={product.productId}
                  product={product}
                  selected={product.productId === selectedProductId}
                  onSelect={() => setSelectedProductId(product.productId)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-display text-[#6B0F1A]">{t("rating")}</p>
              <InteractiveStars value={rating} onChange={setRating} />
            </div>

            <input
              maxLength={140}
              placeholder={t("reviewTitle")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="luxury-input"
            />
            <textarea
              required
              maxLength={2000}
              placeholder={t("reviewBody")}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="luxury-input min-h-36 py-3"
            />

            <button
              type="submit"
              disabled={isSubmitting || !selectedProductId}
              className="w-full bg-[#6B0F1A] px-6 py-3 text-xs font-semibold uppercase tracking-display text-[#FFFFFF] transition hover:bg-[#080808] disabled:opacity-50 sm:w-fit"
            >
              {isSubmitting ? t("loading") : t("submitReview")}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function ProductChoice({
  product,
  selected,
  onSelect,
}: {
  product: ReviewInvitationProduct;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex min-h-24 items-center gap-3 border p-3 text-left transition ${
        selected ? "border-[#6B0F1A] bg-[#FFFFFF]" : "border-[#080808]/10 hover:border-[#6B0F1A]"
      }`}
      onClick={onSelect}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" className="h-16 w-16 bg-[#080808]/5 object-cover" />
      ) : (
        <span className="h-16 w-16 bg-[#080808]/5" />
      )}
      <span className="text-sm font-semibold">{product.productName}</span>
    </button>
  );
}
