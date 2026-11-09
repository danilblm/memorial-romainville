import { Alert, Box, Breadcrumbs, Button, Container, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ApiError, apiSend } from "../../api/client";
import MediaField from "../../components/admin/MediaField";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { mediaUrl } from "../../utils/mediaUrl";
import NotFoundPage from "../NotFoundPage";

interface PlanSettings {
  url?: string;
  width?: number;
  height?: number;
}

// Réglages du site : le vrai plan du fort, sans toucher au code
const AdminSettingsPage = () => {
  const { token, role } = useAuth();
  const { data, reload } = useApi<{ plan?: PlanSettings | null }>("/settings");
  const [plan, setPlan] = useState<PlanSettings>({});
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (data) setPlan(data.plan ?? {});
  }, [data]);

  if (role !== "admin") return <NotFoundPage />;

  // Lit la taille réelle de l'image pour que les positions sur le plan restent justes
  const choosePlan = (url: string) => {
    setPlan((current) => ({ ...current, url }));
    if (!url) return;
    const image = new Image();
    image.onload = () =>
      setPlan((current) => ({ ...current, url, width: image.naturalWidth, height: image.naturalHeight }));
    image.onerror = () => setMessage({ type: "error", text: "Impossible de lire cette image." });
    image.src = mediaUrl(url) ?? url;
  };

  const save = async (next: PlanSettings | null) => {
    setMessage(null);
    try {
      await apiSend("/admin/settings/plan", "PUT", { plan: next }, token);
      setMessage({
        type: "success",
        text: next ? "Plan enregistré. Pensez à replacer les lieux sur le nouveau plan." : "Retour au plan provisoire.",
      });
      reload();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Enregistrement impossible" });
    }
  };

  const complete = Boolean(plan.url && plan.width && plan.height);

  return (
    <Container sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin">
          Administration
        </Link>
        <Typography color="text.primary">Réglages du site</Typography>
      </Breadcrumbs>

      <Typography variant="h3" component="h1" gutterBottom>
        Réglages du site
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Plan du fort
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Téléversez le vrai plan (image JPG, PNG ou WebP). Il remplacera le plan provisoire sur la carte interactive
          et dans le placement des lieux. {data?.plan?.url ? "" : "Le site utilise actuellement le plan provisoire."}
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          Les positions des lieux sont mesurées sur l'image du plan. Après un changement de plan, vérifiez et replacez
          chaque lieu dans sa fiche.
        </Alert>

        <Stack spacing={2}>
          <MediaField label="Image du plan" accept="image/*" value={plan.url} onChange={choosePlan} />
          <Stack direction="row" spacing={2}>
            <TextField
              type="number"
              label="Largeur (px)"
              size="small"
              value={plan.width ?? ""}
              onChange={(event) => setPlan({ ...plan, width: Number(event.target.value) || undefined })}
            />
            <TextField
              type="number"
              label="Hauteur (px)"
              size="small"
              value={plan.height ?? ""}
              onChange={(event) => setPlan({ ...plan, height: Number(event.target.value) || undefined })}
            />
          </Stack>

          {plan.url && (
            <Box
              component="img"
              src={mediaUrl(plan.url)}
              alt="Aperçu du plan"
              sx={{ maxWidth: 600, border: 1, borderColor: "divider", borderRadius: 2 }}
            />
          )}

          {message && <Alert severity={message.type}>{message.text}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={!complete}
              onClick={() => save({ url: plan.url, width: plan.width, height: plan.height })}
            >
              Enregistrer le plan
            </Button>
            {data?.plan?.url && (
              <Button color="error" onClick={() => save(null)}>
                Revenir au plan provisoire
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AdminSettingsPage;
