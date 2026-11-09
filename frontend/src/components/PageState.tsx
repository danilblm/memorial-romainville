import { Alert, Box, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";

// Affiche le chargement ou l'erreur d'une page
const PageState = ({ loading, error }: { loading: boolean; error: string | null }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }} role="status" aria-label={t("common.loading")}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 3 }}>
        {error === "404" ? t("common.notFound") : t("common.error")}
      </Alert>
    );
  }

  return null;
};

export default PageState;
