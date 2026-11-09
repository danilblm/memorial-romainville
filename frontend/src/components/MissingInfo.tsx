import { Alert, AlertTitle, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LocalizedText } from "../types/common";
import { localize } from "../utils/localize";

// La mémoire est incomplète : on montre ce qui manque au lieu de le cacher
const MissingInfo = ({ items }: { items?: LocalizedText[] }) => {
  const { t, i18n } = useTranslation();

  if (!items || items.length === 0) return null;

  return (
    <Alert severity="info" variant="outlined" sx={{ my: 2 }}>
      <AlertTitle>{t("missing.title")}</AlertTitle>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {items.map((item, index) => (
          <li key={index}>{localize(item, i18n.language)}</li>
        ))}
      </Box>
    </Alert>
  );
};

export default MissingInfo;
