import { Card, CardActionArea, CardContent, Container, Grid, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ADMIN_ENTITIES, ENTITY_NAMES } from "../../constants/adminEntities";
import { useAuth } from "../../context/Auth/AuthContext";

const AdminHomePage = () => {
  const { username, role } = useAuth();

  const accountSections = [
    ...(role === "admin"
      ? [
          {
            to: "/admin/comptes",
            title: "Comptes de l'équipe",
            description: "Créer les comptes des membres du groupe, changer leur rôle, réinitialiser un mot de passe.",
          },
          {
            to: "/admin/reglages",
            title: "Réglages du site",
            description: "Téléverser le vrai plan du fort pour la carte interactive.",
          },
        ]
      : []),
    { to: "/admin/mon-compte", title: "Mon compte", description: "Changer mon mot de passe." },
  ];

  const sections = [
    {
      to: "/admin/contributions",
      title: "Contributions du public",
      description: "Vérifier, valider ou refuser les propositions envoyées par les visiteurs.",
    },
    {
      to: "/admin/communaute",
      title: "Communauté du fort",
      description: "Traiter les signalements, masquer une publication, suspendre un membre.",
    },
    ...ENTITY_NAMES.map((name) => ({
      to: `/admin/${name}`,
      title: ADMIN_ENTITIES[name].plural,
      description: ADMIN_ENTITIES[name].description,
    })),
    ...accountSections,
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Administration
      </Typography>
      {username && <Typography sx={{ mb: 3 }}>Connecté·e : {username}</Typography>}

      <Grid container spacing={2}>
        {sections.map((section) => (
          <Grid item xs={12} sm={6} md={4} key={section.to}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardActionArea component={RouterLink} to={section.to} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography color="text.secondary">{section.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminHomePage;
