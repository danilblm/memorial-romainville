import {
  Box,
  Button,
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
    const motive = reason.trim().length >= 3 ? reason : status === "valide" ? "Validée par l'équipe" : "Refusée par l'équipe";
    await apiSend(`/contributions/${item._id}/decision`, "PATCH", { status, reason: motive }, token);
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
    <article className="rounded-2xl border border-line/80 bg-card p-5 shadow-soft">
      <p className="text-sm text-ink-soft">
        {new Date(item.createdAt).toLocaleDateString(i18n.language)} · {item.contributor.name}
        {item.target.label && ` · ${item.target.label}`}
      </p>
      <p className="mt-2 whitespace-pre-line text-ink">{item.content}</p>

      {item.files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label={t("admin.files")}>
          {item.files.map((file, index) => (
            <button
              key={file._id}
              type="button"
              onClick={() => openFile(index)}
              className="rounded-full border border-line px-3 py-1 text-sm text-ink hover:border-accent hover:text-accent"
            >
              {file.originalName}
            </button>
          ))}
        </div>
      )}

      {item.status === "propose" || item.status === "en_verification" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Motif (facultatif)"
            aria-label="Motif (facultatif)"
            className="h-10 min-w-0 flex-1 rounded-full border border-line bg-card px-4 text-sm focus:border-accent focus:outline-none"
          />
          <Button variant="contained" onClick={() => decide("valide")}>
            {t("admin.approve")}
          </Button>
          <Button color="inherit" variant="outlined" onClick={() => decide("refuse")}>
            {t("admin.refuse")}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-ink-soft">{t(`status.${item.status}`)}</p>
      )}
    </article>
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
