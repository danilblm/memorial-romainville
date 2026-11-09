import { Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Publication } from "../../types/common";
import LocalizedTextField from "./LocalizedTextField";

const CONSENTS = [
  { value: "accorde", label: "Accordé" },
  { value: "refuse", label: "Refusé" },
  { value: "inconnu", label: "Inconnu" },
];

const VISIBILITIES = [
  { value: "publique", label: "Publique – fiche complète" },
  { value: "reservee", label: "Réservée – seul le nom est montré (refus d'exposition)" },
  { value: "masquee", label: "Masquée – rien n'apparaît sur le site" },
];

interface Props {
  label: string;
  value?: Publication | null;
  onChange: (value: Publication) => void;
}

// Consentement de la personne ou de sa famille, et ce que le public peut voir
const PublicationField = ({ label, value, onChange }: Props) => {
  const current = value ?? {};

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" component="p">
        {label}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            label="Consentement"
            value={current.consent ?? "inconnu"}
            onChange={(event) => onChange({ ...current, consent: event.target.value as Publication["consent"] })}
          >
            {CONSENTS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            select
            fullWidth
            label="Visibilité publique"
            value={current.visibility ?? "publique"}
            onChange={(event) => onChange({ ...current, visibility: event.target.value as Publication["visibility"] })}
          >
            {VISIBILITIES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <LocalizedTextField
        label="Message affiché au public"
        help="Pour une fiche réservée : explique pourquoi elle est limitée."
        value={current.note}
        onChange={(note) => onChange({ ...current, note })}
      />
    </Stack>
  );
};

export default PublicationField;
