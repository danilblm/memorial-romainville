import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

// Affiche le chargement ou l'erreur d'une page
const PageState = ({ loading, error }: { loading: boolean; error: string | null }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-label={t("common.loading")}>
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent-soft p-5 text-ink" role="alert">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <p>{error === "404" ? t("common.notFound") : t("common.error")}</p>
      </div>
    );
  }

  return null;
};

export default PageState;
