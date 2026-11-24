import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiSend } from "../../api/client";
import AdminPage, { FilterPills } from "../../components/admin/AdminPage";
import PageState from "../../components/PageState";
import { BASE_URL } from "../../constants/baseUrl";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { ValidationStatus } from "../../types/common";
import { Contribution } from "../../types/Contribution";

type Decision = "en_verification" | "valide" | "refuse";

const ContributionCard = ({ item, token, onDone }: { item: Contribution; token: string | null; onDone: () => void }) => {
  const { t, i18n } = useTranslation();
  const [reason, setReason] = useState("");

  const decide = async (status: Decision) => {
    await apiSend(`/contributions/${item._id}/decision`, "PATCH", { status, reason }, token);
    setReason("");
    onDone();
  };

  // Les fichiers sont protégés : on les télécharge avec le jeton
  const openFile = async (index: number) => {
    const response = await fetch(`${BASE_URL}/contributions/${item._id}/files/${index}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const url = URL.createObjectURL(await response.blob());
    window.open(url, "_blank", "noopener");
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">
            {new Date(item.createdAt).toLocaleString(i18n.language)} · {t(`contribute.kinds.${item.target.kind}`)}
            {item.target.label && ` – ${item.target.label}`}
          </Typography>
          <Chip label={t(`status.${item.status}`)} size="small" />
        </Stack>

        <Typography sx={{ whiteSpace: "pre-line", mb: 2 }}>{item.content}</Typography>
        <Typography variant="body2">
          <strong>{t("admin.provenance")} :</strong> {item.declaredProvenance}
        </Typography>
        <Typography variant="body2">
          <strong>{t("admin.from")} :</strong> {item.contributor.name} ({item.contributor.email})
          {item.contributor.relation && ` – ${item.contributor.relation}`}
        </Typography>
        <Typography variant="body2">
          <strong>{t("admin.consent")} :</strong> {item.consentToPublish ? t("common.yes") : t("common.no")}
        </Typography>

        {item.files.length > 0 && (
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }} aria-label={t("admin.files")}>
            {item.files.map((file, index) => (
              <Chip key={file._id} label={file.originalName} onClick={() => openFile(index)} variant="outlined" />
            ))}
          </Stack>
        )}

        {item.decision?.reason && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("admin.decidedBy")} : {item.decision.reason}
            {item.decision.by && ` (${item.decision.by.firstName} ${item.decision.by.lastName})`}
          </Typography>
        )}

        <TextField
          label={t("admin.reason")}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          fullWidth
          multiline
          size="small"
          sx={{ mt: 2 }}
        />
      </CardContent>
      <CardActions>
        <Button disabled={reason.trim().length < 3} onClick={() => decide("en_verification")}>
          {t("admin.verify")}
        </Button>
        <Button disabled={reason.trim().length < 3} color="success" onClick={() => decide("valide")}>
          {t("admin.approve")}
        </Button>
        <Button disabled={reason.trim().length < 3} color="error" onClick={() => decide("refuse")}>
          {t("admin.refuse")}
        </Button>
      </CardActions>
    </Card>
  );
};

const AdminContributionsPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [status, setStatus] = useState<ValidationStatus | "">("propose");
  const { data, loading, error, reload } = useApi<Contribution[]>(
    status ? `/contributions?status=${status}` : "/contributions",
    token
  );

  return (
    <AdminPage title="Contributions du public" lead="Les propositions envoyées par les visiteurs depuis la page « Contribuer ».">
      <div className="mb-6">
        <FilterPills
          label={t("admin.filter")}
          value={status}
          onChange={setStatus}
          options={[
            { value: "propose", label: "À traiter" },
            { value: "en_verification", label: t("status.en_verification") },
            { value: "valide", label: t("status.valide") },
            { value: "refuse", label: t("status.refuse") },
            { value: "", label: t("admin.all") },
          ]}
        />
      </div>

      <PageState loading={loading} error={error} />
      {data && data.length === 0 && <Typography>{t("admin.empty")}</Typography>}

      <Box sx={{ display: "grid", gap: 2 }}>
        {data?.map((item) => (
          <ContributionCard key={item._id} item={item} token={token} onDone={reload} />
        ))}
      </Box>
    </AdminPage>
  );
};

export default AdminContributionsPage;
