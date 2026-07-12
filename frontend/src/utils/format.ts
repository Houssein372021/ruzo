import type { Language } from "../types";

export const FREE_DELIVERY_THRESHOLD = 70;
export const DELIVERY_FEE = 7;

export function formatCurrency(value: number, language: Language) {
  return new Intl.NumberFormat(language === "ar" ? "ar" : "en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizePrice(value: number | string) {
  return typeof value === "string" ? Number(value) : value;
}

export function getDeliveryFee(subtotal: number) {
  return subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
}

export function getFreeDeliveryRemaining(subtotal: number) {
  return Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);
}
