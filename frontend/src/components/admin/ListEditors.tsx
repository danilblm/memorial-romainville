import { Autocomplete, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { LocalizedText } from "../../types/common";
import LocalizedTextField from "./LocalizedTextField";
import MediaField from "./MediaField";

// Liste de mots libres (rôles, orthographes du nom)
export const TagsField = ({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value?: string[] | null;
  onChange: (value: string[]) => void;
  help?: string;
}) => (
  <Autocomplete
    multiple
    freeSolo
    options={[] as string[]}
    value={value ?? []}
    onChange={(_, next) => onChange(next.map((item) => item.trim()).filter(Boolean))}
    renderTags={(tags, getTagProps) =>
      tags.map((tag, index) => {
        const { key, ...tagProps } = getTagProps({ index });
        return <Chip key={key} label={tag} {...tagProps} />;
      })
    }
    renderInput={(params) => <TextField {...params} label={label} helperText={help} />}
  />
);

// Liste de textes bilingues (ex. « Ce que l'on ne sait pas »)
export const LocalizedListEditor = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: LocalizedText[] | null;
  onChange: (value: LocalizedText[]) => void;
}) => {
  const items = value ?? [];

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" component="p">
        {label}
      </Typography>
      {items.map((item, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
          <Stack sx={{ flexGrow: 1 }}>
            <LocalizedTextField
              label={`Élément ${index + 1}`}
              value={item}
              onChange={(next) => onChange(items.map((current, i) => (i === index ? next : current)))}
            />
          </Stack>
          <Button color="error" sx={{ mt: 4 }} onClick={() => onChange(items.filter((_, i) => i !== index))}>
            Retirer
          </Button>
        </Stack>
      ))}
      <Button variant="outlined" onClick={() => onChange([...items, { fr: "", en: "" }])} sx={{ alignSelf: "flex-start" }}>
        Ajouter
      </Button>
    </Stack>
  );
};

export interface PhotoValue {
  _id?: string;
  url: string;
  caption?: LocalizedText;
  source?: string | null;
}

// Photographies d'un lieu
export const PhotosEditor = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: PhotoValue[] | null;
  onChange: (value: PhotoValue[]) => void;
}) => {
  const photos = value ?? [];
  const update = (index: number, patch: Partial<PhotoValue>) =>
    onChange(photos.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)));

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" component="p">
        {label}
      </Typography>
      {photos.map((photo, index) => (
        <Paper key={photo._id ?? `new-${index}`} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <MediaField label="Image" accept="image/*" value={photo.url} onChange={(url) => update(index, { url })} />
            <LocalizedTextField
              label="Légende (décrit aussi l'image pour les lecteurs d'écran)"
              value={photo.caption}
              onChange={(caption) => update(index, { caption })}
            />
            <Button color="error" sx={{ alignSelf: "flex-end" }} onClick={() => onChange(photos.filter((_, i) => i !== index))}>
              Retirer
            </Button>
          </Stack>
        </Paper>
      ))}
      <Button
        variant="outlined"
        onClick={() => onChange([...photos, { url: "", caption: { fr: "", en: "" } }])}
        sx={{ alignSelf: "flex-start" }}
      >
        Ajouter une photo
      </Button>
    </Stack>
  );
};
