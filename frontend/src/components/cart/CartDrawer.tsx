import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { selectCartTotals, useCartStore } from "../../store/cartStore";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  formatCurrency,
  getDeliveryFee,
  getFreeDeliveryRemaining,
} from "../../utils/format";
import { QuantityStepper } from "../common/QuantityStepper";

export function CartDrawer() {
  const { language, t } = useI18n();
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { quantity, subtotal } = selectCartTotals(items);
  const deliveryFee = getDeliveryFee(subtotal);
  const remaining = getFreeDeliveryRemaining(subtotal);
  const total = subtotal + deliveryFee;
  const freeDeliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-[#080808]/45"
        >
          <button
            type="button"
            aria-label={t("closeCart")}
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#080808]/10 bg-[#FFFFFF] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#080808]/10 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-display text-[#6B0F1A]">
                  {t("cart")}
                </p>
                <h2 className="font-display mt-1 text-2xl text-[#080808]">
                  {quantity} {quantity === 1 ? t("itemSingular") : t("itemPlural")}
                </h2>
              </div>
              <button
                type="button"
                aria-label={t("closeCart")}
                className="grid h-10 w-10 place-items-center bg-white"
                onClick={closeCart}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="grid flex-1 place-items-center px-8 text-center">
                <div>
                  <ShoppingBag className="mx-auto h-10 w-10 text-[#6B0F1A]" />
                  <p className="mt-4 text-lg font-semibold">{t("emptyCart")}</p>
                  <Link
                    to="/collections/sets"
                    onClick={closeCart}
                    className="mt-6 inline-flex bg-[#6B0F1A] px-6 py-3 text-sm font-semibold text-[#FFFFFF]"
                  >
                    {t("continueShopping")}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-[#080808]/10 bg-[#080808] px-6 py-4">
                  <p className="mb-2 text-xs text-[#FFFFFF]/72">
                    {remaining > 0
                      ? t("freeDeliveryRemaining", {
                          amount: formatCurrency(remaining, language),
                        })
                      : t("freeDeliveryUnlocked")}
                  </p>
                  <div className="h-0.5 overflow-hidden bg-[#FFFFFF]/18">
                    <div
                      className="h-full bg-[#6B0F1A] transition-all duration-500"
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="grid gap-5">
                    {items.map((item) => (
                      <div key={item.lineId} className="grid grid-cols-[88px_1fr] gap-4">
                        <img
                          src={item.imageUrl ?? ""}
                          alt={language === "ar" ? item.nameAr : item.nameEn}
                          className="aspect-[3/4] w-full border border-[#080808]/10 bg-[#FFFFFF] object-cover"
                        />
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#080808]">
                                {language === "ar" ? item.nameAr : item.nameEn}
                              </p>
                              <p className="mt-1 text-xs text-[#080808]/62">
                                {[item.color, item.size].filter(Boolean).join(" / ")}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              {formatCurrency(item.price * item.quantity, language)}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <QuantityStepper
                              value={item.quantity}
                              onChange={(value) => updateQuantity(item.lineId, value)}
                            />
                            <button
                              type="button"
                              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B0F1A]"
                              onClick={() => removeItem(item.lineId)}
                            >
                              {t("remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#080808]/10 bg-white px-6 py-5">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t("subtotal")}</span>
                      <span>{formatCurrency(subtotal, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("delivery")}</span>
                      <span>
                        {deliveryFee === 0 ? t("free") : formatCurrency(DELIVERY_FEE, language)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#080808]/10 pt-3 text-base font-semibold">
                      <span>{t("total")}</span>
                      <span>{formatCurrency(total, language)}</span>
                    </div>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="mt-5 flex h-12 items-center justify-center bg-[#6B0F1A] text-sm font-semibold uppercase tracking-[0.18em] text-[#FFFFFF] transition hover:bg-[#080808]"
                  >
                    {t("checkout")}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
