import { useEffect, type ReactNode } from "react";
import { useI18n } from "../hooks/useI18n";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const { language, dir } = useI18n();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [dir, language]);

  return <>{children}</>;
}
