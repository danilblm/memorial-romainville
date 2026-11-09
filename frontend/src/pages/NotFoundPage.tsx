import { Button, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("common.notFound")}
      </Typography>
      <Button component={RouterLink} to="/" variant="outlined">
        {t("common.back")}
      </Button>
    </Container>
  );
};

export default NotFoundPage;
