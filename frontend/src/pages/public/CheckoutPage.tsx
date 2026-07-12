import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { ordersApi } from "../../api/orders";
import { productsApi } from "../../api/products";
import { EmptyState } from "../../components/common/EmptyState";
import { Seo } from "../../components/common/Seo";
import { useI18n } from "../../hooks/useI18n";
import { selectCartTotals, useCartStore } from "../../store/cartStore";
import { useCheckoutStore } from "../../store/checkoutStore";
import type { CustomerInfo, OrderPayload } from "../../types";
import { formatCurrency, getDeliveryFee } from "../../utils/format";

type CheckoutForm = CustomerInfo & {
  paymentMethod: "cash-on-delivery";
  saveDetails: boolean;
};

const emptyCustomer: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  whatsapp: "",
  city: "",
  country: "",
  address: "",
  notes: "",
  paymentMethod: "cash-on-delivery",
  saveDetails: true,
};

export function CheckoutPage() {
  const { language, t } = useI18n();
  const invalidCartMessage = t("invalidCart");
  const requiredMessage = t("required");
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const savedCustomer = useCheckoutStore((state) => state.customer);
  const setCustomer = useCheckoutStore((state) => state.setCustomer);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<CheckoutForm>({
    defaultValues: {
      ...emptyCustomer,
      ...savedCustomer,
      saveDetails: true,
    },
  });

  useEffect(() => {
    let isMounted = true;

    productsApi.getAll()
      .then((products) => {
        if (!isMounted) {
          return;
        }

        const activeProductIds = new Set(products.map((product) => product.id));
        const validItems = items.filter((item) => activeProductIds.has(item.id));

        if (validItems.length !== items.length) {
          replaceItems(validItems);
          setError(invalidCartMessage);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(t("apiUnavailable"));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [invalidCartMessage, items, replaceItems, t]);

  const totals = useMemo(() => {
    const { subtotal } = selectCartTotals(items);
    const deliveryFee = getDeliveryFee(subtotal);
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  }, [items]);

  if (items.length === 0 && !formState.isSubmitSuccessful) {
    return (
      <>
        <Seo title="Checkout | Rüzo" description="Rüzo checkout." path="/checkout" robots="noindex,nofollow" />
        <EmptyState title={t("emptyCart")} actionTo="/collections/sets" />
      </>
    );
  }

  const onSubmit = async ({ saveDetails, paymentMethod, ...customer }: CheckoutForm) => {
    setError("");

    try {
      const products = await productsApi.getAll();
      const activeProductIds = new Set(products.map((product) => product.id));
      const validItems = items.filter((item) => activeProductIds.has(item.id));

      if (validItems.length !== items.length) {
        replaceItems(validItems);
        setError(invalidCartMessage);
        return;
      }
    } catch {
      setError(t("apiUnavailable"));
      return;
    }

    if (saveDetails) {
      setCustomer(customer);
    }

    const payload: OrderPayload = {
      language,
      customer,
      paymentMethod: paymentMethod === "cash-on-delivery" ? "Cash on delivery" : paymentMethod,
      items: items.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        slug: item.slug,
        name: language === "ar" ? item.nameAr : item.nameEn,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
    };

    try {
      const response = await ordersApi.create(payload);
      const orderNumber = response.orderNumber ?? response.number ?? response.id ?? t("orderReceived");
      clearCart();
      navigate(`/confirmation?order=${encodeURIComponent(orderNumber)}`);
    } catch (error) {
      setError(isAxiosError(error) && error.response?.status === 400 ? invalidCartMessage : t("apiUnavailable"));
    }
  };

  return (
    <>
      <Seo title="Checkout | Rüzo" description="Rüzo checkout." path="/checkout" robots="noindex,nofollow" />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b725f]">{t("checkoutEyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold">{t("customerInfo")}</h1>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CheckoutInput label={t("firstName")} error={formState.errors.firstName?.message}>
              <input {...register("firstName", { required: requiredMessage })} className="checkout-input" />
            </CheckoutInput>
            <CheckoutInput label={t("lastName")} error={formState.errors.lastName?.message}>
              <input {...register("lastName", { required: requiredMessage })} className="checkout-input" />
            </CheckoutInput>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CheckoutInput label={t("email")} error={formState.errors.email?.message}>
              <input
                type="email"
                {...register("email", { required: requiredMessage })}
                className="checkout-input"
              />
            </CheckoutInput>
            <CheckoutInput label={t("phone")} error={formState.errors.phone?.message}>
              <input {...register("phone", { required: requiredMessage })} className="checkout-input" />
            </CheckoutInput>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CheckoutInput label={t("whatsapp")}>
              <input {...register("whatsapp")} className="checkout-input" />
            </CheckoutInput>
            <CheckoutInput label={t("country")}>
              <input {...register("country")} className="checkout-input" />
            </CheckoutInput>
          </div>
          <CheckoutInput label={t("city")} error={formState.errors.city?.message}>
            <input {...register("city", { required: requiredMessage })} className="checkout-input" />
          </CheckoutInput>
          <CheckoutInput label={t("address")} error={formState.errors.address?.message}>
            <input {...register("address", { required: requiredMessage })} className="checkout-input" />
          </CheckoutInput>
          <CheckoutInput label={t("notes")}>
            <textarea {...register("notes")} className="checkout-input min-h-28 py-3" />
          </CheckoutInput>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b725f]">
              {t("paymentMethod")}
            </p>
            <label className="flex min-h-20 items-start gap-3 border border-[#d8cbbd] bg-[#fbf7f1] p-4 text-[#4b2e24] transition has-[:checked]:border-[#4b2e24] has-[:checked]:bg-[#f8f4ec]">
              <input
                type="radio"
                value="cash-on-delivery"
                {...register("paymentMethod", { required: requiredMessage })}
                className="mt-1 accent-[#4B2E24]"
              />
              <span>
                <span className="block text-sm font-semibold">{t("cashOnDelivery")}</span>
                <span className="mt-1 block text-sm leading-6 text-[#6d6258]">
                  {t("cashOnDeliveryCheckoutCopy")}
                </span>
              </span>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#6d6258]">
            <input type="checkbox" {...register("saveDetails")} className="accent-[#4B2E24]" />
            {t("saveDetails")}
          </label>

          {error ? <p className="bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="h-14 bg-[#4B2E24] text-sm font-semibold uppercase tracking-[0.18em] text-[#F8F4EC] transition hover:bg-[#3a2118] disabled:opacity-60"
          >
            {formState.isSubmitting ? t("loading") : t("placeOrder")}
          </button>
          </form>
        </div>

        <aside className="h-fit bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{t("orderSummary")}</h2>
        <div className="mt-6 grid gap-5">
          {items.map((item) => (
            <div key={item.lineId} className="grid grid-cols-[72px_1fr] gap-4">
              <img src={item.imageUrl ?? ""} alt="" className="aspect-[3/4] object-cover" />
              <div>
                <p className="text-sm font-semibold">{language === "ar" ? item.nameAr : item.nameEn}</p>
                <p className="mt-1 text-xs text-[#6d6258]">
                  {[item.color, item.size].filter(Boolean).join(" / ")} x {item.quantity}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity, language)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-[#ded2c5] pt-5 text-sm">
          <div className="flex justify-between">
            <span>{t("subtotal")}</span>
            <span>{formatCurrency(totals.subtotal, language)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("delivery")}</span>
            <span>{totals.deliveryFee === 0 ? t("free") : formatCurrency(totals.deliveryFee, language)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{t("paymentMethod")}</span>
            <span className="text-right">{t("cashOnDelivery")}</span>
          </div>
          <div className="flex justify-between border-t border-[#ded2c5] pt-3 text-lg font-semibold">
            <span>{t("total")}</span>
            <span>{formatCurrency(totals.total, language)}</span>
          </div>
        </div>
        </aside>
      </section>
    </>
  );
}

type CheckoutInputProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function CheckoutInput({ label, error, children }: CheckoutInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8b725f]">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

export function CheckoutRedirect() {
  return <Navigate to="/checkout" replace />;
}
