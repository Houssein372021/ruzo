import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { adminApi } from "../../api/admin";
import { AdminPanel } from "../../components/admin/AdminPanel";
import { AdminStatCard } from "../../components/admin/AdminStatCard";
import { DashboardSkeleton } from "../../components/common/Skeleton";
import { useI18n } from "../../hooks/useI18n";
import type { TranslationKey } from "../../i18n/translations";
import type { AdminDashboard, OrderStatus } from "../../types";
import { formatCurrency } from "../../utils/format";

const orderStatusTranslationKeys: Record<OrderStatus, TranslationKey> = {
  NEW: "statusNew",
  CONFIRMED: "statusConfirmed",
  PROCESSING: "statusProcessing",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered",
  CANCELLED: "statusCancelled",
};

export function AdminDashboardPage() {
  const { language, t } = useI18n();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    adminApi
      .dashboard()
      .then((data) => {
        if (isMounted) {
          setDashboard(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(t("apiUnavailable"));
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
  }, [t]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <h1 className="admin-page-heading">{t("dashboard")}</h1>
      </div>
      {error ? <p className="admin-notice">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={t("orders")} value={`${dashboard?.totalOrders ?? 0}`} icon={ShoppingBag} />
        <AdminStatCard
          label={t("sales")}
          value={formatCurrency(dashboard?.totalSales ?? 0, language)}
          icon={DollarSign}
        />
        <AdminStatCard label={t("products")} value={`${dashboard?.topProducts.length ?? 0}`} icon={Package} />
        <AdminStatCard label={t("customers")} value={`${dashboard?.recentCustomers.length ?? 0}`} icon={Users} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title={t("recentOrders")}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("orderNumber")}</th>
                <th>{t("customers")}</th>
                <th>{t("total")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.recentOrders ?? []).map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{formatCurrency(order.total, language)}</td>
                  <td>{t(orderStatusTranslationKeys[order.status])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanel>
        <AdminPanel title={t("topProducts")}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("products")}</th>
                <th>{t("categories")}</th>
                <th>{t("price")}</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.topProducts ?? []).map((product) => (
                <tr key={product.id}>
                  <td>{language === "ar" ? product.nameAr : product.nameEn}</td>
                  <td>{product.category ? (language === "ar" ? product.category.nameAr : product.category.nameEn) : ""}</td>
                  <td>{formatCurrency(product.price, language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminPanel>
      </div>
    </div>
  );
}
