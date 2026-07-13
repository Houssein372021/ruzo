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
    <header className={`${positionClass} z-40 border-b border-[#080808]/10 bg-[#FFFFFF] text-[#080808] shadow-[0_1px_0_rgba(8,8,8,0.04)]`}>
      <div className="mx-auto grid h-[70px] w-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {hasMobileMenu ? (
            <button
              type="button"
              aria-label={t("menu")}
              className="-ms-2 grid h-10 w-10 place-items-center text-[#080808] transition hover:text-[#6B0F1A] lg:hidden"
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : null}

          {navItems.length > 0 ? (
            <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.22em] lg:flex">
              {navItems.map((item) => (
                <TopBarNavLink key={item.to} item={item} />
              ))}
            </nav>
          ) : null}
        </div>

        <Link
          to={brandTo}
          className="font-display text-center text-[1.9rem] uppercase leading-none tracking-[0.18em] text-[#6B0F1A] transition hover:text-[#080808] sm:text-[2.25rem]"
        >
          RÜZO
          {eyebrow ? (
            <span className="mt-1 block font-sans text-[0.6rem] uppercase tracking-[0.24em] text-[#080808]/60">
              {eyebrow}
            </span>
          ) : null}
        </Link>

        <div className="flex min-w-0 items-center justify-end text-[#080808]">
          {actions}
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && hasMobileMenu ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-t border-[#080808]/10 bg-[#FFFFFF] text-[#080808] lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4 text-sm uppercase tracking-[0.22em]">
              {navItems.map((item) => (
                <TopBarNavLink
                  key={item.to}
                  item={item}
                  isMobile
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
              {mobileActions ? <div className="mt-2 border-t border-[#080808]/10 pt-4">{mobileActions}</div> : null}
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
              isActive ? "text-[#6B0F1A]" : "text-[#080808]/70 hover:text-[#6B0F1A]"
            }`
          : `flex shrink-0 items-center gap-2 whitespace-nowrap transition-colors ${
              isActive ? "text-[#6B0F1A]" : "text-[#080808]/68 hover:text-[#6B0F1A]"
            }`
      }
    >
      {Icon && !isMobile ? <Icon className="h-4 w-4" /> : null}
      <span>{item.label}</span>
    </NavLink>
  );
}
