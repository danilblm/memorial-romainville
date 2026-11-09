import { Box, Container, Link, List, ListItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import PageState from "../components/PageState";
import WomenTree from "../components/WomenTree";
import { useApi } from "../hooks/useApi";
import { PersonSummary } from "../types/Person";

const HomePage = () => {
  const { t } = useTranslation();
  const { data: persons, loading, error } = useApi<PersonSummary[]>("/persons");

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("home.title")}
      </Typography>
      <Typography sx={{ maxWidth: 720, mb: 4 }}>{t("home.intro")}</Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        {t("home.treeTitle")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("home.treeHelp")}
      </Typography>

      <PageState loading={loading} error={error} />
      {persons && (
        <>
          <WomenTree persons={persons} />

          {/* Même contenu sous forme de liste, pour les lecteurs d'écran et le clavier */}
          <Box component="section" sx={{ mt: 4 }}>
            <Typography variant="h6" component="h2">
              {t("home.listTitle")}
            </Typography>
            <List dense>
              {persons.map((person) => (
                <ListItem key={person._id} disableGutters>
                  <Link component={RouterLink} to={`/personnes/${person._id}`}>
                    {person.displayName}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}
    </Container>
  );
};

export default HomePage;
