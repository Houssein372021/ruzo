import { EmptyState } from "../../components/common/EmptyState";
import { Seo } from "../../components/common/Seo";
import { useI18n } from "../../hooks/useI18n";

export function NotFoundPage() {
  const { t } = useI18n();

  return (
    <>
      <Seo
        title="Page not found | Rüzo"
        description="This Rüzo page could not be found."
        robots="noindex,nofollow"
      />
      <EmptyState title={t("pageNotFound")} actionTo="/" actionLabel={t("backToRuzo")} />
    </>
  );
}
