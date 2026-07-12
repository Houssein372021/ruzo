import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, type LucideIcon } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export type TopBarItem = {
  to: string;
  label: string;
  icon?: LucideIcon;
};

type TopBarProps = {
  brandTo?: string;
  eyebrow?: string;
  navItems: TopBarItem[];
  actions?: ReactNode;
  mobileActions?: ReactNode;
  fixed?: boolean;
};

export function TopBar({
  brandTo = "/",
  eyebrow,
  navItems,
  actions,
  mobileActions,
  fixed = false,
}: TopBarProps) {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasMobileMenu = navItems.length > 0 || Boolean(mobileActions);
  const positionClass = fixed ? "fixed inset-x-0 top-0" : "sticky top-0";

  return (
    <header className={`${positionClass} z-40 border-b border-[#ded2c5]/60 bg-[#F8F4EC]/75 backdrop-blur-md`}>
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 lg:px-10">
        {hasMobileMenu ? (
          <button
            type="button"
            aria-label={t("menu")}
            className="-ms-2 p-2 lg:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        ) : (
          <span className="h-9 w-9 lg:hidden" aria-hidden="true" />
        )}

        <Link to={brandTo} className="font-display text-center text-2xl leading-none tracking-[0.3em] text-[#4B2E24]">
          <span className="block uppercase">RÜZO</span>
          {eyebrow ? (
            <span className="mt-1 block font-sans text-[0.6rem] uppercase tracking-[0.28em] text-[#8b725f]">
              {eyebrow}
            </span>
          ) : null}
        </Link>

        {navItems.length > 0 ? (
          <nav className="hidden items-center gap-8 text-[12px] uppercase tracking-display lg:flex">
            {navItems.map((item) => (
              <TopBarNavLink key={item.to} item={item} />
            ))}
          </nav>
        ) : null}

        <div className="flex min-w-9 items-center justify-end gap-1 text-[12px] text-[#111111]">{actions}</div>
      </div>

      <AnimatePresence>
        {isMenuOpen && hasMobileMenu ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-t border-[#ded2c5]/60 bg-[#F8F4EC] lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4 text-sm uppercase tracking-display">
              {navItems.map((item) => (
                <TopBarNavLink
                  key={item.to}
                  item={item}
                  isMobile
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
              {mobileActions ? <div className="mt-2 border-t border-[#ded2c5]/60 pt-4">{mobileActions}</div> : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function TopBarNavLink({
  item,
  isMobile = false,
  onClick,
}: {
  item: TopBarItem;
  isMobile?: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        isMobile
          ? `py-2 transition-colors ${
              isActive ? "text-[#4B2E24]" : "text-[#111111]/80 hover:text-[#4B2E24]"
            }`
          : `flex shrink-0 items-center gap-2 whitespace-nowrap transition-colors ${
              isActive ? "text-[#4B2E24]" : "text-[#111111]/70 hover:text-[#4B2E24]"
            }`
      }
    >
      {Icon && !isMobile ? <Icon className="h-4 w-4" /> : null}
      <span>{item.label}</span>
    </NavLink>
  );
}
