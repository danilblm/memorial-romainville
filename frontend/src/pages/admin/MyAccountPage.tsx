import { Alert, Box, Breadcrumbs, Button, Container, Link, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { apiSend } from "../../api/client";
import { useAuth } from "../../context/Auth/AuthContext";

// Chaque membre de l'équipe peut changer son mot de passe provisoire
const MyAccountPage = () => {
  const { token, username } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (next !== confirm) {
      setMessage({ type: "error", text: "Les deux nouveaux mots de passe ne sont pas identiques." });
      return;
    }
    try {
      await apiSend("/user/me/password", "PATCH", { currentPassword: current, newPassword: next }, token);
      setMessage({ type: "success", text: "Mot de passe modifié." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Modification impossible" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin">
          Administration
        </Link>
        <Typography color="text.primary">Mon compte</Typography>
      </Breadcrumbs>

      <Typography variant="h3" component="h1" gutterBottom>
        Mon compte
      </Typography>
      {username && <Typography sx={{ mb: 3 }}>{username}</Typography>}

      <Typography variant="h6" component="h2" gutterBottom>
        Changer mon mot de passe
      </Typography>
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <TextField
            required
            type="password"
            label="Mot de passe actuel"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
          <TextField
            required
            type="password"
            label="Nouveau mot de passe"
            autoComplete="new-password"
            helperText="10 caractères minimum."
            inputProps={{ minLength: 10 }}
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
          <TextField
            required
            type="password"
            label="Confirmer le nouveau mot de passe"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          <Button type="submit" variant="contained">
            Enregistrer
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default MyAccountPage;
