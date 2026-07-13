import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Copy, Eye, Mail, MapPin, MessageCircle, Phone, Search, Trash2, X } from "lucide-react";
import { ordersApi } from "../../api/orders";
import { AdminConfirmDialog } from "../../components/admin/AdminConfirmDialog";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n/translations";
import type { AdminOrder, OrderStatus } from "../../types";
import { formatCurrency } from "../../utils/format";

const statuses: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const orderStatusTranslationKeys: Record<OrderStatus, TranslationKey> = {
  NEW: "statusNew",
  CONFIRMED: "statusConfirmed",
  PROCESSING: "statusProcessing",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  CANCELLED: "statusCancelled",
};

function whatsappUrl(phone?: string) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function displayText(value?: string | null) {
  return value && value.trim() ? value : "-";
}

function formatOrderDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function reviewLink(token?: string) {
  return token ? `${window.location.origin}/review/${token}` : "";
}

export function AdminOrdersPage() {
  const { language, t } = useI18n();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(() => {
    ordersApi
      .getAll()
      .then(setOrders)
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch = `${order.orderNumber} ${order.customerName}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === "ALL" || order.status === status;
        return matchesSearch && matchesStatus;
      }),
    [orders, search, status],
  );

  const handleStatusChange = async (id: string, nextStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(id, nextStatus);
      loadOrders();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) {
      return;
    }

    const id = orderToDelete.id;
    try {
      await ordersApi.delete(id);
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
      setOrderToDelete(null);
      loadOrders();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader title={t("orders")} />
      {error ? <p className="admin-notice">{error}</p> : null}
      <AdminPanel
        title={t("orders")}
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A2638]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("search")}
                className="admin-search-input"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus | "ALL")}
              className="admin-select"
            >
              <option value="ALL">{t("all")}</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {t(orderStatusTranslationKeys[item])}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("orderNumber")}</th>
              <th>{t("customers")}</th>
              <th>{t("total")}</th>
              <th>{t("status")}</th>
              <th>{t("details")}</th>
              <th>{t("whatsapp")}</th>
              <th>{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="font-semibold">{order.orderNumber}</span>
                </td>
                <td>{order.customerName}</td>
                <td>{formatCurrency(order.total, language)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                    className="admin-select min-h-9 text-xs"
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {t(orderStatusTranslationKeys[item])}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => setSelectedOrder(order)}
                    title={t("details")}
                    aria-label={`${t("details")} ${order.orderNumber}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
                <td>
                  {whatsappUrl(order.customerPhone) ? (
                    <a
                      href={whatsappUrl(order.customerPhone)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-icon-button inline-grid"
                      title={t("whatsapp")}
                      aria-label={`${t("whatsapp")} ${order.customerName}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  ) : null}
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => setOrderToDelete(order)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPanel>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080808]/45 px-4 py-8">
          <div className="mx-auto w-full max-w-4xl border border-[#E6D9DE] bg-[#FFFFFF] shadow-2xl">
            <div className="flex items-start justify-between gap-6 bg-[#6B0F1A] px-6 py-6 text-[#FFFFFF] sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.42em]">RÜZO</p>
                <h2 className="mt-4 font-display text-2xl">{selectedOrder.orderNumber}</h2>
                <p className="mt-2 text-sm text-[#F4E8EB]">{t(orderStatusTranslationKeys[selectedOrder.status])}</p>
              </div>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center border border-[#F4E8EB]/45 text-[#FFFFFF] transition hover:bg-[#FFFFFF]/10"
                onClick={() => setSelectedOrder(null)}
                aria-label={t("cancel")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-7 px-6 py-7 sm:px-8">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="border border-[#E6D9DE] bg-white p-5">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8A2638]">
                        {t("customerInfo")}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{selectedOrder.customerName}</h3>
                    </div>
                    {whatsappUrl(selectedOrder.customerPhone) ? (
                      <a
                        href={whatsappUrl(selectedOrder.customerPhone)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 border border-[#6B0F1A] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B0F1A] transition hover:bg-[#6B0F1A] hover:text-[#FFFFFF]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {t("whatsapp")}
                      </a>
                    ) : null}
                  </div>

                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#8A2638]" />
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("email")}</dt>
                        <dd className="mt-1 wrap-break-word font-medium">{displayText(selectedOrder.email)}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#8A2638]" />
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("phone")}</dt>
                        <dd className="mt-1 font-medium">{displayText(selectedOrder.phone)}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3 sm:col-span-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8A2638]" />
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("address")}</dt>
                        <dd className="mt-1 font-medium">{displayText(selectedOrder.address)}</dd>
                      </div>
                    </div>
                  </dl>
                </section>

                <section className="border border-[#E6D9DE] bg-white p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8A2638]">
                    {t("details")}
                  </p>
                  <dl className="mt-5 grid gap-4 text-sm">
                    <div className="flex gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#8A2638]" />
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">Date</dt>
                        <dd className="mt-1 font-medium">{formatOrderDate(selectedOrder.createdAt)}</dd>
                      </div>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[#EEE3E6] pt-4">
                      <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">Payment</dt>
                      <dd className="text-right font-medium">{displayText(selectedOrder.paymentMethod)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[#EEE3E6] pt-4">
                      <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("whatsapp")}</dt>
                      <dd className="text-right font-medium">{displayText(selectedOrder.whatsapp ?? selectedOrder.customerPhone)}</dd>
                    </div>
                    {selectedOrder.reviewToken ? (
                      <div className="border-t border-[#EEE3E6] pt-4">
                        <dt className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("reviewLink")}</dt>
                        <dd className="mt-2 grid gap-2">
                          <input
                            readOnly
                            value={reviewLink(selectedOrder.reviewToken)}
                            className="luxury-input h-10 text-xs"
                          />
                          <button
                            type="button"
                            className="inline-flex w-fit items-center gap-2 border border-[#6B0F1A] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B0F1A] transition hover:bg-[#6B0F1A] hover:text-[#FFFFFF]"
                            onClick={() => navigator.clipboard?.writeText(reviewLink(selectedOrder.reviewToken))}
                          >
                            <Copy className="h-4 w-4" />
                            {t("copy")}
                          </button>
                          {selectedOrder.status !== "DELIVERED" ? (
                            <p className="text-xs leading-5 text-[#8A2638]">{t("reviewLinkAfterDeliveryAdmin")}</p>
                          ) : null}
                          <p className="text-xs leading-5 text-[#8A2638]">
                            {selectedOrder.reviewRequestSentAt ? t("reviewEmailSent") : t("reviewEmailNotSent")}
                          </p>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              </div>

              <section className="border border-[#E6D9DE] bg-white">
                <div className="flex items-center justify-between border-b border-[#E6D9DE] px-5 py-4">
                  <h3 className="font-display text-xl">{t("products")}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A2638]">
                    {(selectedOrder.items ?? []).length} {t("products")}
                  </span>
                </div>
                <div className="divide-y divide-[#EEE3E6]">
                  {(selectedOrder.items ?? []).map((item) => (
                    <div key={item.id} className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="mt-1 text-sm text-[#8A2638]">
                          {[item.color, item.size].filter(Boolean).join(" / ") || "-"}
                        </p>
                      </div>
                      <div className="text-sm sm:text-center">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("quantity")}</p>
                        <p className="mt-1 font-semibold">{item.quantity}</p>
                      </div>
                      <div className="text-sm sm:min-w-28 sm:text-right">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("total")}</p>
                        <p className="mt-1 font-semibold">{formatCurrency(item.totalPrice, language)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
                <section className="border border-[#E6D9DE] bg-white p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#8A2638]">
                    {t("notes")}
                  </p>
                  <p className="mt-3 text-sm leading-6">{displayText(selectedOrder.notes)}</p>
                </section>

                <section className="border border-[#E6D9DE] bg-white p-5">
                  <dl className="grid gap-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt>{t("subtotal")}</dt>
                      <dd className="font-medium">{formatCurrency(selectedOrder.subtotal ?? 0, language)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>{t("delivery")}</dt>
                      <dd className="font-medium">{formatCurrency(selectedOrder.deliveryFee ?? 0, language)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-[#E6D9DE] pt-4 text-lg font-semibold">
                      <dt>{t("total")}</dt>
                      <dd>{formatCurrency(selectedOrder.total, language)}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {orderToDelete ? (
        <AdminConfirmDialog
          title={t("confirmDeleteOrderTitle", { orderNumber: orderToDelete.orderNumber })}
          body={t("confirmDeleteOrderBody")}
          cancelLabel={t("cancel")}
          confirmLabel={t("deleteOrder")}
          onCancel={() => setOrderToDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
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
