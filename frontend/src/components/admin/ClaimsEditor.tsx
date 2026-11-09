import { Button, FormControlLabel, FormHelperText, Grid, MenuItem, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LocalizedText, RELIABILITY_LEVELS, Reliability, ValidationStatus } from "../../types/common";
import LocalizedTextField from "./LocalizedTextField";
import { RefsField } from "./RefFields";

export interface ClaimValue {
  _id?: string;
  field: string;
  value: LocalizedText;
  sources: string[];
  reliability: Reliability;
  status: ValidationStatus;
  note?: string;
  aiAssisted?: boolean;
}

const STATUSES: ValidationStatus[] = ["propose", "en_verification", "valide", "refuse"];

const emptyClaim = (): ClaimValue => ({
  field: "",
  value: { fr: "", en: "" },
  sources: [],
  reliability: "inconnue",
  status: "propose",
  note: "",
  aiAssisted: false,
});

interface Props {
  label: string;
  value?: ClaimValue[] | null;
  onChange: (value: ClaimValue[]) => void;
  help?: string;
}

// Liste d'affirmations : chacune a ses sources, sa fiabilité et son statut
const ClaimsEditor = ({ label, value, onChange, help }: Props) => {
  const { t } = useTranslation();
  const claims = value ?? [];

  const update = (index: number, patch: Partial<ClaimValue>) =>
    onChange(claims.map((claim, i) => (i === index ? { ...claim, ...patch } : claim)));

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" component="p">
        {label}
      </Typography>
      {help && <FormHelperText sx={{ mt: 0 }}>{help}</FormHelperText>}

      {claims.map((claim, index) => (
        <Paper key={claim._id ?? `new-${index}`} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Sujet"
              value={claim.field}
              required
              helperText="Sur quoi porte l'affirmation, ex. arrivee, deportation, role."
              onChange={(event) => update(index, { field: event.target.value })}
            />
            <LocalizedTextField
              label="Affirmation"
              required
              value={claim.value}
              onChange={(next) => update(index, { value: next })}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Fiabilité"
                  value={claim.reliability}
                  onChange={(event) => update(index, { reliability: event.target.value as Reliability })}
                >
                  {RELIABILITY_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {t(`reliability.${level}.label`)} – {t(`reliability.${level}.desc`)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Statut"
                  value={claim.status}
                  onChange={(event) => update(index, { status: event.target.value as ValidationStatus })}
                >
                  {STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {t(`status.${status}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <RefsField
              entity="sources"
              label="Sources de cette affirmation"
              value={claim.sources}
              onChange={(next) => update(index, { sources: next })}
            />
            <TextField
              label="Note (désaccord entre sources, précision…)"
              value={claim.note ?? ""}
              multiline
              onChange={(event) => update(index, { note: event.target.value })}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(claim.aiAssisted)}
                    onChange={(event) => update(index, { aiAssisted: event.target.checked })}
                  />
                }
                label="Produite avec l'aide d'une IA (affiché au public)"
              />
              <Button color="error" onClick={() => onChange(claims.filter((_, i) => i !== index))}>
                Retirer
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      <Button variant="outlined" onClick={() => onChange([...claims, emptyClaim()])} sx={{ alignSelf: "flex-start" }}>
        Ajouter une affirmation
      </Button>
    </Stack>
  );
};

export default ClaimsEditor;
