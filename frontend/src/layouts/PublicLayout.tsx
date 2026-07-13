import { Outlet } from "react-router-dom";
import { CartDrawer } from "../components/cart/CartDrawer";
import { AnnouncementBar } from "../components/layout/AnnouncementBar";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#080808]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
