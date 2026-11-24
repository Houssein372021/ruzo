import type { ReactNode } from "react";
import { AdminLanguageButton } from "./AdminLanguageButton";
import { Seo } from "../common/Seo";
import { TopBar } from "../layout/TopBar";
import { useI18n } from "../../hooks/useI18n";

export function AdminAuthPanel({ title, path, children }: { title: string; path: string; children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="admin-shell min-h-screen bg-[#F7F7F7]">
      <Seo title={`${title} | RÜZO`} description={title} path={path} robots="noindex,nofollow" />
      <TopBar eyebrow={t("admin")} navItems={[]} actions={<AdminLanguageButton />} />
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-10">
        <section className="w-full max-w-[384px] border border-[#E5E5E5] bg-[#FFFFFF] px-8 py-9">
          <div className="text-center">
            <p className="text-xl uppercase tracking-[0.34em]">RÜZO</p>
            <p className="mt-2 text-[0.68rem] uppercase tracking-[0.28em] text-[#444444]">{t("admin")}</p>
          </div>
          <h1 className="font-display mt-7 text-lg text-[#080808]">{title}</h1>
          {children}
        </section>
      </main>
    </div>
  );
}
