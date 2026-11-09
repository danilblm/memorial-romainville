import {
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Link,
  MenuItem,
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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import PageState from "../../components/PageState";
import { getEntityConfig } from "../../constants/adminEntities";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { ValidationStatus } from "../../types/common";
import NotFoundPage from "../NotFoundPage";

interface Row {
  _id: string;
  label: string;
  status: ValidationStatus;
  updatedAt: string;
}

const STATUSES: ValidationStatus[] = ["propose", "en_verification", "valide", "refuse"];

const AdminListPage = () => {
  const { entity } = useParams();
  const config = getEntityConfig(entity);
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [status, setStatus] = useState<ValidationStatus | "">("");
  const [search, setSearch] = useState("");

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search.trim()) query.set("q", search.trim());
  const { data, loading, error } = useApi<Row[]>(config ? `/admin/${entity}?${query}` : null, token);

  if (!config) return <NotFoundPage />;

  return (
    <Container sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin">
          Administration
        </Link>
        <Typography color="text.primary">{config.plural}</Typography>
      </Breadcrumbs>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1">
          {config.plural}
        </Typography>
        <Button variant="contained" component={RouterLink} to={`/admin/${entity}/nouveau`}>
          Ajouter : {config.singular.toLowerCase()}
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Rechercher"
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: 260 }}
        />
        <TextField
          select
          label="Statut"
          size="small"
          value={status}
          onChange={(event) => setStatus(event.target.value as ValidationStatus | "")}
          sx={{ minWidth: 200 }}
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">Tous</MenuItem>
          {STATUSES.map((value) => (
            <MenuItem key={value} value={value}>
              {t(`status.${value}`)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <PageState loading={loading && !data} error={error} />

      {data && data.length === 0 && <Typography>Aucune fiche pour le moment.</Typography>}

      {data && data.length > 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Modifiée le</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row._id} hover>
                  <TableCell>{row.label || "(sans titre)"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={t(`status.${row.status}`)}
                      color={row.status === "valide" ? "success" : row.status === "refuse" ? "error" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{new Date(row.updatedAt).toLocaleString(i18n.language)}</TableCell>
                  <TableCell align="right">
                    <Button component={RouterLink} to={`/admin/${entity}/${row._id}`} size="small">
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminListPage;
