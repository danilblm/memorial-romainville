import { MenuItem, Stack, TextField } from "@mui/material";
import { DatePrecision, FuzzyDate } from "../../types/common";

const PRECISIONS: { value: DatePrecision; label: string }[] = [
  { value: "jour", label: "Jour exact" },
  { value: "mois", label: "Mois (le jour est ignoré)" },
  { value: "annee", label: "Année seulement" },
  { value: "vers", label: "Approximative (« vers »)" },
  { value: "inconnue", label: "Inconnue" },
];

interface Props {
  label: string;
  value?: FuzzyDate | null;
  onChange: (value: FuzzyDate) => void;
  required?: boolean;
  help?: string;
}

// Une date historique avec sa précision
const FuzzyDateField = ({ label, value, onChange, required, help }: Props) => {
  const current = value ?? {};
  const dateText = current.date ? String(current.date).slice(0, 10) : "";

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <TextField
        type="date"
        label={label}
        value={dateText}
        required={required}
        helperText={help}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 220 }}
        onChange={(event) =>
          onChange({
            ...current,
            date: event.target.value || null,
            precision: event.target.value ? current.precision ?? "jour" : "inconnue",
          })
        }
      />
      <TextField
        select
        label={`${label} – précision`}
        value={current.precision ?? "inconnue"}
        sx={{ minWidth: 260 }}
        onChange={(event) => onChange({ ...current, precision: event.target.value as DatePrecision })}
      >
        {PRECISIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};

export default FuzzyDateField;
