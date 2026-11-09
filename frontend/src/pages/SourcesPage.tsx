import { Box, Container, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReliabilityBadge from "../components/ReliabilityBadge";
import { RELIABILITY_LEVELS } from "../types/common";

// Explique au public les règles du mémorial : fiabilité, validation, IA
const SourcesPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("sources.title")}
      </Typography>
      <Typography sx={{ mb: 4 }}>{t("sources.intro")}</Typography>

      <Box component="section" id="fiabilite" sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("sources.reliabilityTitle")}
        </Typography>
        <List>
          {RELIABILITY_LEVELS.map((level) => (
            <ListItem key={level} disableGutters>
              <ListItemIcon sx={{ minWidth: 150 }}>
                <ReliabilityBadge level={level} />
              </ListItemIcon>
              <ListItemText primary={t(`reliability.${level}.desc`)} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box component="section" sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {t("sources.validationTitle")}
        </Typography>
        <Typography>{t("sources.validationText")}</Typography>
      </Box>

      <Box component="section">
        <Typography variant="h5" component="h2" gutterBottom>
          {t("sources.aiTitle")}
        </Typography>
        <Typography>{t("sources.aiText")}</Typography>
      </Box>
    </Container>
  );
};

export default SourcesPage;
