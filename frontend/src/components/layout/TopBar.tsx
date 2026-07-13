import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X, type LucideIcon } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export type TopBarItem = {
  to: string;
  label: string;
  icon?: LucideIcon;
  megaMenu?: TopBarMegaMenuColumn[];
};

export type TopBarMegaMenuColumn = {
  title: string;
  links: TopBarMegaMenuLink[];
};

export type TopBarMegaMenuLink = {
  to: string;
  label: string;
  description?: string;
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
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const hasMobileMenu = navItems.length > 0 || Boolean(mobileActions);
  const positionClass = fixed ? "fixed inset-x-0 top-0" : "sticky top-0";
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileSubmenu(null);
  };
  const toggleMobileMenu = () => {
    if (isMenuOpen) {
      setOpenMobileSubmenu(null);
    }
    setIsMenuOpen((value) => !value);
  };

  return (
    <header className={`${positionClass} relative z-40 border-b border-[#080808]/10 bg-[#FFFFFF] text-[#080808] shadow-[0_1px_0_rgba(8,8,8,0.04)]`}>
      <div className="mx-auto grid h-[70px] w-full max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:gap-4 sm:px-5 lg:px-8">
        <div className="flex h-full min-w-0 items-center gap-4">
          {hasMobileMenu ? (
            <button
              type="button"
              aria-label={t("menu")}
              className="-ms-2 grid h-10 w-10 place-items-center text-[#080808] transition hover:text-[#6B0F1A] lg:hidden"
              onClick={toggleMobileMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : null}

          {navItems.length > 0 ? (
            <nav className="hidden h-full items-center gap-8 text-[11px] uppercase tracking-[0.22em] lg:flex">
              {navItems.map((item, index) => (
                <TopBarNavLink key={`${item.label}-${item.to}-${index}`} item={item} />
              ))}
            </nav>
          ) : null}
        </div>

        <Link
          to={brandTo}
          className="font-display text-center text-[1.45rem] uppercase leading-none tracking-[0.12em] text-[#6B0F1A] transition hover:text-[#080808] sm:text-[2.25rem] sm:tracking-[0.18em]"
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
            className="max-h-[calc(100vh-70px)] overflow-y-auto border-t border-[#080808]/10 bg-[#FFFFFF] text-[#080808] lg:hidden"
          >
            <nav className="flex flex-col px-5 py-3 text-sm uppercase tracking-[0.22em]">
              {navItems.map((item, index) => {
                const itemId = `${item.label}-${item.to}-${index}`;

                return (
                  <TopBarNavLink
                    key={itemId}
                    item={item}
                    isMobile
                    isOpen={openMobileSubmenu === itemId}
                    onToggle={() =>
                      setOpenMobileSubmenu((current) => (current === itemId ? null : itemId))
                    }
                    onClick={closeMobileMenu}
                  />
                );
              })}
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
  isOpen = false,
  onToggle,
  onClick,
}: {
  item: TopBarItem;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  if (isMobile) {
    if (item.megaMenu) {
      return (
        <div className="border-b border-[#080808]/8">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 py-4 text-left text-[13px] uppercase tracking-[0.28em] text-[#080808] transition hover:text-[#6B0F1A]"
            onClick={onToggle}
            aria-expanded={isOpen}
          >
            <span>{item.label}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#6B0F1A]" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {isOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 border-s border-[#6B0F1A]/20 pb-5 ps-4 normal-case tracking-normal">
                  {item.megaMenu.map((column) => (
                    <MobileMegaMenuColumn key={column.title} column={column} onClick={onClick} />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        to={item.to}
        onClick={onClick}
        className={({ isActive }) =>
          `border-b border-[#080808]/8 py-4 text-[13px] uppercase tracking-[0.28em] transition-colors ${
            isActive ? "text-[#6B0F1A]" : "text-[#080808] hover:text-[#6B0F1A]"
          }`
        }
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="group flex h-[70px] items-center">
      <NavLink
        to={item.to}
        onClick={onClick}
        className={({ isActive }) =>
          `flex shrink-0 items-center gap-2 whitespace-nowrap transition-colors ${
            isActive ? "text-[#6B0F1A]" : "text-[#080808]/68 hover:text-[#6B0F1A]"
          }`
        }
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span>{item.label}</span>
      </NavLink>
      {item.megaMenu ? <TopBarMegaMenu columns={item.megaMenu} /> : null}
    </div>
  );
}

function MobileMegaMenuColumn({
  column,
  onClick,
}: {
  column: TopBarMegaMenuColumn;
  onClick?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-1 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B0F1A]"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span>{column.title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-1">
              {column.links.map((link) => (
                <Link
                  key={`${column.title}-${link.to}`}
                  to={link.to}
                  onClick={onClick}
                  className="-ms-2 block px-2 py-2.5 text-sm text-[#080808]/72 transition hover:bg-[#6B0F1A]/5 hover:text-[#6B0F1A]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TopBarMegaMenu({ columns }: { columns: TopBarMegaMenuColumn[] }) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-[calc(100%-1px)] hidden border-t border-[#080808]/10 bg-[#FFFFFF] opacity-0 shadow-[0_28px_70px_rgba(8,8,8,0.10)] transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 lg:block">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-8 py-10 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#080808]">
              {column.title}
            </p>
            <div className="mt-6 grid gap-3">
              {column.links.map((link) => (
                <Link
                  key={`${column.title}-${link.to}`}
                  to={link.to}
                  className="group/link -mx-3 flex min-h-[54px] items-center justify-between gap-5 border border-transparent px-3 py-2 text-[13px] uppercase tracking-[0.08em] text-[#080808]/80 transition hover:border-[#6B0F1A]/15 hover:bg-[#6B0F1A]/5 hover:text-[#6B0F1A]"
                >
                  <span className="min-w-0">
                    <span className="block">{link.label}</span>
                    {link.description ? (
                      <span className="mt-1 block text-[11px] normal-case leading-5 tracking-normal text-[#080808]/45 transition group-hover/link:text-[#6B0F1A]/70">
                        {link.description}
                      </span>
                    ) : null}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover/link:translate-x-1 group-hover/link:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
