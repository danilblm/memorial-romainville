import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiSend } from "../api/client";
import { ContributionTarget } from "../types/Contribution";

const TARGETS: ContributionTarget[] = ["person", "place", "event", "source", "autre"];

const ContributePage = () => {
  const { t } = useTranslation();
  const [targetKind, setTargetKind] = useState<ContributionTarget>("person");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("targetKind", targetKind);
    data.set("consentToPublish", String(consent));

    setState("sending");
    try {
      await apiSend("/contributions", "POST", data);
      setState("success");
      form.reset();
      setConsent(false);
    } catch {
      setState("error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("contribute.title")}
      </Typography>
      <Typography sx={{ mb: 3 }}>{t("contribute.intro")}</Typography>

      {state === "success" && <Alert severity="success" sx={{ mb: 3 }}>{t("contribute.success")}</Alert>}
      {state === "error" && <Alert severity="error" sx={{ mb: 3 }}>{t("contribute.error")}</Alert>}

      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <TextField name="contributorName" label={t("contribute.name")} required />
          <TextField name="contributorEmail" type="email" label={t("contribute.email")} required helperText={t("contribute.privacy")} />
          <TextField name="contributorRelation" label={t("contribute.relation")} />

          <FormControl>
            <InputLabel id="target-label">{t("contribute.targetKind")}</InputLabel>
            <Select
              labelId="target-label"
              label={t("contribute.targetKind")}
              value={targetKind}
              onChange={(event) => setTargetKind(event.target.value as ContributionTarget)}
            >
              {TARGETS.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {t(`contribute.kinds.${kind}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField name="targetLabel" label={t("contribute.targetLabel")} />
          <TextField name="content" label={t("contribute.content")} required multiline minRows={5} inputProps={{ minLength: 10 }} />
          <TextField name="declaredProvenance" label={t("contribute.provenance")} required multiline minRows={2} />

          <Box>
            <Typography component="label" htmlFor="files" sx={{ display: "block", mb: 1 }}>
              {t("contribute.files")}
            </Typography>
            <input id="files" name="files" type="file" multiple accept="image/*,application/pdf,audio/*" />
          </Box>

          <FormControlLabel
            control={<Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)} required />}
            label={t("contribute.consent")}
          />

          <Button type="submit" variant="contained" size="large" disabled={state === "sending"}>
            {t("contribute.submit")}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ContributePage;
