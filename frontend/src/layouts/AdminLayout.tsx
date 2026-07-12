import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, FolderTree, LogOut, Package, ShoppingBag, Star, Users } from "lucide-react";
import { AdminLanguageButton } from "../components/admin/AdminLanguageButton";
import { Seo } from "../components/common/Seo";
import { TopBar } from "../components/layout/TopBar";
import { useI18n } from "../hooks/useI18n";
import { useAuthStore } from "../store/authStore";

const adminNav = [
  { to: "/admin/dashboard", key: "dashboard", icon: BarChart3 },
  { to: "/admin/products", key: "products", icon: Package },
  { to: "/admin/categories", key: "categories", icon: FolderTree },
  { to: "/admin/orders", key: "orders", icon: ShoppingBag },
  { to: "/admin/reviews", key: "reviews", icon: Star },
  { to: "/admin/customers", key: "customers", icon: Users },
] as const;

export function AdminLayout() {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const adminTopBarItems = adminNav.map((item) => ({
    to: item.to,
    label: t(item.key),
    icon: item.icon,
  }));

  const logoutButton = (
    <button
      type="button"
      className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6d6258] transition hover:text-[#4B2E24]"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
      {t("logout")}
    </button>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f4ec] text-[#111111] xl:grid xl:grid-cols-[240px_minmax(0,1fr)]">
      <Seo title="Admin | Rüzo" description="Rüzo admin area." path="/admin" robots="noindex,nofollow" />
      <div className="xl:hidden">
        <TopBar
          brandTo="/admin/dashboard"
          eyebrow={t("admin")}
          navItems={adminTopBarItems}
          actions={<AdminLanguageButton />}
          mobileActions={logoutButton}
          fixed
        />
      </div>

      <aside className="hidden min-h-screen border-r border-[#ded2c5] bg-[#f1e8dc] xl:flex xl:flex-col">
        <div className="border-b border-[#ded2c5] px-6 py-8">
          <Link to="/admin/dashboard" className="block text-xl uppercase tracking-[0.32em] text-[#111111]">
            RÜZO
          </Link>
          <span className="mt-2 block text-[0.62rem] uppercase tracking-[0.28em] text-[#8b725f]">
            {t("admin")}
          </span>
        </div>

        <nav className="grid gap-2 px-4 py-4">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#4B2E24] font-semibold text-[#F8F4EC]"
                    : "text-[#111111] hover:bg-[#e6dbcf]"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#ded2c5] px-5 py-5">
          <p className="mb-3 text-xs text-[#6f6258]">admin@ruzo.local</p>
          <AdminLanguageButton className="mb-3 w-full justify-start bg-[#f8f4ec]" />
          <button
            type="button"
            className="flex items-center gap-2 text-xs text-[#6f6258] transition hover:text-[#4B2E24]"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("logout")}
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-300 min-w-0 overflow-x-hidden px-5 pb-8 pt-24 sm:px-8 lg:pb-9 xl:mx-0 xl:max-w-none xl:px-8 xl:py-9">
        <Outlet />
      </main>
    </div>
  );
}
