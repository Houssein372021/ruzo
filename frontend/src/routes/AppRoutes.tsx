import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { HomePage } from "../pages/public/HomePage";
import { CollectionPage, DynamicCollectionPage } from "../pages/public/CollectionPage";
import { ProductDetailPage } from "../pages/public/ProductDetailPage";
import { FavoritesPage } from "../pages/public/FavoritesPage";
import { CheckoutPage } from "../pages/public/CheckoutPage";
import { ConfirmationPage } from "../pages/public/ConfirmationPage";
import { ReviewPage } from "../pages/public/ReviewPage";
import { AboutPage } from "../pages/public/AboutPage";
import { ContactPage } from "../pages/public/ContactPage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminCustomersPage } from "../pages/admin/AdminCustomersPage";
import { AdminReviewsPage } from "../pages/admin/AdminReviewsPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="sets" element={<CollectionPage categorySlug="sets" titleKey="sets" />} />
          <Route
            path="sport-bras"
            element={<CollectionPage categorySlug="sport-bras" titleKey="sportsBras" />}
          />
          <Route path="sports-bras" element={<Navigate to="/collections/sport-bras" replace />} />
          <Route
            path="bottoms"
            element={<CollectionPage categorySlug="bottoms" titleKey="bottoms" />}
          />
          <Route path="collections/:slug" element={<DynamicCollectionPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
          <Route path="order-confirmation/:orderNumber" element={<ConfirmationPage />} />
          <Route path="review/:token" element={<ReviewPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
