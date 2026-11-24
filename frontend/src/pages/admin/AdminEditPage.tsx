import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
} from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiSend } from "../../api/client";
import AdminPage from "../../components/admin/AdminPage";
import FieldRenderer from "../../components/admin/FieldRenderer";
import PageState from "../../components/PageState";
import { FormValues, getEntityConfig } from "../../constants/adminEntities";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import NotFoundPage from "../NotFoundPage";

interface SaveError {
  message: string;
  details?: Record<string, string>;
}

const AdminEditPage = () => {
  const { entity, id } = useParams();
  const config = getEntityConfig(entity);
  const isNew = id === "nouveau";
  const { token, role } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error } = useApi<FormValues>(config && !isNew ? `/admin/${entity}/${id}` : null, token);
  const [values, setValues] = useState<FormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveError | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!config) return;
    if (isNew) setValues(config.defaults());
    else if (data) setValues(data);
  }, [config, isNew, data]);

  if (!config) return <NotFoundPage />;

  const setField = (key: string, value: unknown) => setValues((current) => ({ ...(current ?? {}), [key]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!values) return;

    setSaving(true);
    setSaveError(null);
    try {
      if (isNew) {
        const created = await apiSend<{ _id: string }>(`/admin/${entity}`, "POST", values, token);
        navigate(`/admin/${entity}/${created._id}`, { replace: true });
      } else {
        setValues(await apiSend<FormValues>(`/admin/${entity}/${id}`, "PUT", values, token));
      }
      setSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? { message: err.message, details: err.details } : { message: "Erreur inconnue" }
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await apiSend(`/admin/${entity}/${id}`, "DELETE", undefined, token);
      navigate(`/admin/${entity}`);
    } catch (err) {
      setConfirmDelete(false);
      setSaveError({ message: err instanceof Error ? err.message : "Suppression impossible" });
    }
  };

  const mainFields = config.main.map((key) => config.fields.find((field) => field.key === key)!).filter(Boolean);
  const otherFields = config.fields.filter((field) => !config.main.includes(field.key));

  const title = isNew ? `Nouvelle fiche : ${config.singular.toLowerCase()}` : `Modifier : ${config.singular.toLowerCase()}`;

  return (
    <AdminPage title={title} back={{ to: `/admin/${entity}`, label: config.plural }}>
      {!isNew && <PageState loading={loading && !values} error={error} />}

      {values && (
        <Box component="form" onSubmit={save}>
          <Stack spacing={3} sx={{ p: { xs: 2.5, sm: 4 }, border: 1, borderColor: "divider", borderRadius: 4, bgcolor: "background.paper" }}>
            {mainFields.map((field) => (
              <Box key={field.key}>
                <FieldRenderer field={{ ...field, help: undefined }} value={values[field.key]} onChange={(value) => setField(field.key, value)} />
              </Box>
            ))}
          </Stack>

          {/* Le reste, rarement utile : fermé par défaut */}
          {otherFields.length > 0 && (
            <details className="group mt-4 rounded-2xl border border-line bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-ink">
                Plus de détails
                <span className="text-sm font-normal text-ink-soft group-open:hidden">{otherFields.length} champs facultatifs</span>
              </summary>
              <Stack spacing={3} sx={{ px: { xs: 2.5, sm: 4 }, pb: 4 }}>
                {otherFields.map((field) => (
                  <Box key={field.key}>
                    <FieldRenderer field={field} value={values[field.key]} onChange={(value) => setField(field.key, value)} />
                  </Box>
                ))}
              </Stack>
            </details>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {saveError.message}
              {saveError.details && (
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {Object.entries(saveError.details).map(([key, message]) => (
                    <li key={key}>
                      {key} : {message}
                    </li>
                  ))}
                </Box>
              )}
            </Alert>
          )}

          {/* Barre d'actions toujours visible */}
          <Paper
            variant="outlined"
            sx={{ position: "sticky", bottom: 12, mt: 3, p: 1.5, display: "flex", gap: 1.5, flexWrap: "wrap", zIndex: 10, borderRadius: 999, boxShadow: "0 8px 30px rgba(0,0,0,.08)" }}
          >
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button component={RouterLink} to={`/admin/${entity}`}>
              Annuler
            </Button>
            {!isNew && role === "admin" && (
              <Button color="error" sx={{ ml: "auto" }} onClick={() => setConfirmDelete(true)}>
                Supprimer
              </Button>
            )}
          </Paper>
        </Box>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Supprimer définitivement cette fiche ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cette action est irréversible. Pour retirer une fiche du site sans la perdre, passez plutôt son statut à
            « Refusée ».
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
          <Button color="error" onClick={remove}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Fiche enregistrée"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </AdminPage>
  );
};

export default AdminEditPage;
