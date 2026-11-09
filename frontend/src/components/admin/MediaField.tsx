import { Box, Button, Stack, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { uploadMedia } from "../../api/client";
import { useAuth } from "../../context/Auth/AuthContext";
import { mediaUrl } from "../../utils/mediaUrl";

interface Props {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  accept?: string;
  help?: string;
}

const IMAGE_PATTERN = /\.(jpe?g|png|webp|gif|svg)$/i;

// Adresse d'un média, saisie à la main ou téléversée
const MediaField = ({ label, value, onChange, accept, help }: Props) => {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = value ?? "";

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await uploadMedia(file, token);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? `Échec du téléversement : ${err.message}` : "Échec du téléversement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          fullWidth
          label={label}
          value={url}
          onChange={(event) => onChange(event.target.value)}
          helperText={error ?? help}
          error={Boolean(error)}
        />
        <Button component="label" variant="outlined" disabled={uploading} sx={{ whiteSpace: "nowrap", mt: 1 }}>
          {uploading ? "Envoi…" : "Téléverser"}
          <input hidden type="file" accept={accept} onChange={upload} />
        </Button>
      </Stack>
      {url && IMAGE_PATTERN.test(url) && (
        <Box component="img" src={mediaUrl(url)} alt="" sx={{ maxWidth: 220, maxHeight: 160, objectFit: "contain" }} />
      )}
    </Stack>
  );
};

export default MediaField;
