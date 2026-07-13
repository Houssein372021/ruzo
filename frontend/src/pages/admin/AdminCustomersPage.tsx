import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Search, Trash2, X } from "lucide-react";
import { adminApi } from "../../api/admin";
import { AdminConfirmDialog } from "../../components/admin/AdminConfirmDialog";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { useI18n } from "../../hooks/useI18n";
import type { AdminCustomer } from "../../types";
import { formatCurrency } from "../../utils/format";

export function AdminCustomersPage() {
  const { language, t } = useI18n();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<AdminCustomer | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadCustomers = useCallback(() => {
    adminApi
      .customers()
      .then(setCustomers)
      .catch(() => setError(t("apiUnavailable")));
  }, [t]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const confirmDelete = async () => {
    if (!customerToDelete) {
      return;
    }

    try {
      await adminApi.deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      if (selectedCustomer?.id === customerToDelete.id) {
        setSelectedCustomer(null);
      }
      loadCustomers();
    } catch {
      setError(t("apiUnavailable"));
    }
  };

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [customers, search],
  );

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-heading">{t("customers")}</h1>
      </div>
      {error ? <p className="admin-notice">{error}</p> : null}
      <AdminPanel
        title={t("customers")}
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
              <th>{t("customers")}</th>
              <th>{t("email")}</th>
              <th>{t("orders")}</th>
              <th>{t("sales")}</th>
              <th>{t("last")}</th>
              <th>{t("details")}</th>
              <th>{t("delete")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-xs text-[#8A2638]">{customer.phone}</div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.ordersCount}</td>
                <td>{formatCurrency(customer.totalSpent, language)}</td>
                <td>{formatCustomerDate(customer.lastOrder)}</td>
                <td>
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => setSelectedCustomer(customer)}
                    title={t("viewOrders")}
                    aria-label={`${t("viewOrders")} ${customer.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => setCustomerToDelete(customer)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPanel>

      {selectedCustomer ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080808]/45 px-4 py-8">
          <div className="mx-auto w-full max-w-4xl border border-[#E6D9DE] bg-[#FFFFFF] shadow-2xl">
            <div className="flex items-start justify-between gap-6 bg-[#6B0F1A] px-6 py-6 text-[#FFFFFF] sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.42em]">{t("customers")}</p>
                <h2 className="mt-4 font-display text-2xl">{selectedCustomer.name}</h2>
                <p className="mt-2 text-sm text-[#F4E8EB]">
                  {[selectedCustomer.email, selectedCustomer.phone].filter(Boolean).join(" / ")}
                </p>
              </div>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center border border-[#F4E8EB]/45 text-[#FFFFFF] transition hover:bg-[#FFFFFF]/10"
                onClick={() => setSelectedCustomer(null)}
                aria-label={t("cancel")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-7 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryBox label={t("orders")} value={`${selectedCustomer.ordersCount}`} />
                <SummaryBox label={t("sales")} value={formatCurrency(selectedCustomer.totalSpent, language)} />
                <SummaryBox label={t("last")} value={formatCustomerDate(selectedCustomer.lastOrder)} />
              </div>

              <section className="border border-[#E6D9DE] bg-white">
                <div className="border-b border-[#E6D9DE] px-5 py-4">
                  <h3 className="font-display text-xl">{t("viewOrders")}</h3>
                </div>
                <div className="divide-y divide-[#EEE3E6]">
                  {(selectedCustomer.orders ?? []).length === 0 ? (
                    <p className="px-5 py-5 text-sm text-[#5F5659]">{t("noOrders")}</p>
                  ) : (
                    selectedCustomer.orders?.map((order) => (
                      <div key={order.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-start">
                        <div>
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8A2638]">
                            {formatCustomerDate(order.createdAt)} · {order.status}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#5F5659]">
                            {(order.products ?? []).join(", ") || "-"}
                          </p>
                        </div>
                        <div className="text-sm lg:text-center">
                          <p className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("quantity")}</p>
                          <p className="mt-1 font-semibold">
                            {(order.items ?? []).reduce((sum, item) => sum + item.quantity, 0)}
                          </p>
                        </div>
                        <div className="text-sm lg:min-w-28 lg:text-right">
                          <p className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{t("total")}</p>
                          <p className="mt-1 font-semibold">{formatCurrency(order.total, language)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {customerToDelete ? (
        <AdminConfirmDialog
          title={t("confirmDeleteCustomerTitle", { customerName: customerToDelete.name })}
          body={t("confirmDeleteCustomerBody")}
          cancelLabel={t("cancel")}
          confirmLabel={t("deleteCustomer")}
          onCancel={() => setCustomerToDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#E6D9DE] bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[#8A2638]">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function formatCustomerDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
