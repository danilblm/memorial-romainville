import { Box, FormHelperText, Grid, TextField, Typography } from "@mui/material";
import { LocalizedText } from "../../types/common";

interface Props {
  label: string;
  value?: LocalizedText | null;
  onChange: (value: LocalizedText) => void;
  multiline?: boolean;
  required?: boolean;
  help?: string;
}

// Un texte en français et en anglais
const LocalizedTextField = ({ label, value, onChange, multiline, required, help }: Props) => {
  const current = value ?? {};

  return (
    <Box>
      <Typography variant="subtitle2" component="p" sx={{ mb: 1 }}>
        {label}
        {required && " *"}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={`${label} – français`}
            value={current.fr ?? ""}
            onChange={(event) => onChange({ ...current, fr: event.target.value })}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            required={required}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={`${label} – English`}
            value={current.en ?? ""}
            onChange={(event) => onChange({ ...current, en: event.target.value })}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
          />
        </Grid>
      </Grid>
      {help && <FormHelperText>{help}</FormHelperText>}
    </Box>
  );
};

export default LocalizedTextField;
