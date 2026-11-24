import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AdminPage from "../../components/admin/AdminPage";
import { FormEvent, useState } from "react";
import { apiSend } from "../../api/client";
import PageState from "../../components/PageState";
import { useAuth, UserRole } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { generatePassword } from "../../utils/password";
import NotFoundPage from "../NotFoundPage";

interface TeamUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "moderateur", label: "Modérateur·rice – saisit les fiches et modère" },
  { value: "admin", label: "Admin – gère aussi les comptes et peut supprimer" },
];

const roleLabel = (role: UserRole) => (role === "admin" ? "Admin" : "Modérateur·rice");

// Message à transmettre au membre (le mot de passe n'est affiché qu'une fois)
interface Credentials {
  name: string;
  email: string;
  password: string;
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "", role: "moderateur" as UserRole };

const AdminUsersPage = () => {
  const { token, role } = useAuth();
  const { data: users, loading, error, reload } = useApi<TeamUser[]>(role === "admin" ? "/user" : null, token);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [toDelete, setToDelete] = useState<TeamUser | null>(null);

  if (role !== "admin") return <NotFoundPage />;

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    try {
      await apiSend("/user", "POST", form, token);
      setCredentials({ name: `${form.firstName} ${form.lastName}`, email: form.email, password: form.password });
      setForm(EMPTY_FORM);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Création impossible");
    }
  };

  const changeRole = async (user: TeamUser, nextRole: UserRole) => {
    setActionError(null);
    try {
      await apiSend(`/user/${user._id}`, "PATCH", { role: nextRole }, token);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Modification impossible");
    }
  };

  const resetPassword = async (user: TeamUser) => {
    setActionError(null);
    const password = generatePassword();
    try {
      await apiSend(`/user/${user._id}`, "PATCH", { password }, token);
      setCredentials({ name: `${user.firstName} ${user.lastName}`, email: user.email, password });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Réinitialisation impossible");
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setActionError(null);
    try {
      await apiSend(`/user/${toDelete._id}`, "DELETE", undefined, token);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <AdminPage title="Comptes de l'équipe">

      {credentials && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setCredentials(null)}>
          <Typography fontWeight={600}>Identifiants de {credentials.name}</Typography>
          <Typography>E-mail : {credentials.email}</Typography>
          <Typography>
            Mot de passe provisoire : <Box component="code" sx={{ fontSize: "1.1em" }}>{credentials.password}</Box>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Transmettez-les directement à la personne (pas dans un groupe). Ils ne seront plus affichés ensuite. Elle
            pourra changer son mot de passe dans « Mon compte ».
          </Typography>
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <PageState loading={loading && !users} error={error} />

      {users && (
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      onChange={(event) => changeRole(user, event.target.value as UserRole)}
                      inputProps={{ "aria-label": `Rôle de ${user.firstName} ${user.lastName}` }}
                    >
                      {ROLES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {roleLabel(option.value)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => resetPassword(user)}>
                        Nouveau mot de passe
                      </Button>
                      <Button size="small" color="error" onClick={() => setToDelete(user)}>
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Ajouter un membre
        </Typography>
        <Box component="form" onSubmit={create}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Prénom"
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nom"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="E-mail"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Rôle"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
              >
                {ROLES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  fullWidth
                  required
                  label="Mot de passe provisoire"
                  value={form.password}
                  helperText="10 caractères minimum."
                  inputProps={{ minLength: 10 }}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <Button
                  variant="outlined"
                  sx={{ whiteSpace: "nowrap", mt: 1 }}
                  onClick={() => setForm({ ...form, password: generatePassword() })}
                >
                  Générer
                </Button>
              </Stack>
            </Grid>
          </Grid>
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Créer le compte
          </Button>
        </Box>
      </Paper>

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Supprimer ce compte ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toDelete?.firstName} {toDelete?.lastName} ne pourra plus se connecter. Les fiches qu'elle ou il a saisies
            sont conservées.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Annuler</Button>
          <Button color="error" onClick={remove}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  );
};

export default AdminUsersPage;
