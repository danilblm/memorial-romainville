import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { apiSend } from "../../api/client";
import AdminPage, { FilterPills } from "../../components/admin/AdminPage";
import PageState from "../../components/PageState";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { mediaUrl } from "../../utils/mediaUrl";

type Filter = "reported" | "hidden" | "all";
type Status = "publie" | "masque";

interface Report {
  by?: { displayName: string } | null;
  reason: string;
  at: string;
}

interface ModeratedPost {
  _id: string;
  author?: { displayName: string; email: string } | null;
  kind: string;
  title?: string;
  text: string;
  image?: { url?: string };
  status: Status;
  reports: Report[];
  moderation?: { reason?: string; at?: string; by?: { firstName: string; lastName: string } };
  createdAt: string;
}

interface ModeratedComment {
  _id: string;
  author?: { displayName: string; email: string } | null;
  post?: { _id: string; title?: string; text: string } | null;
  text: string;
  status: Status;
  reports: Report[];
  createdAt: string;
}

interface ModeratedMember {
  _id: string;
  displayName: string;
  email: string;
  profile: string;
  suspended: boolean;
  postCount: number;
  createdAt: string;
}

const formatDate = (date?: string) => (date ? new Date(date).toLocaleString("fr-FR") : "");

const Reports = ({ reports }: { reports: Report[] }) =>
  reports.length === 0 ? null : (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <strong>{reports.length} signalement(s)</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
        {reports.map((report, index) => (
          <li key={index}>
            {report.reason} — {report.by?.displayName ?? "membre"}, {formatDate(report.at)}
          </li>
        ))}
      </ul>
    </Alert>
  );

const PostModeration = ({ item, token, onDone }: { item: ModeratedPost; token: string | null; onDone: () => void }) => {
  const [reason, setReason] = useState("");
  const decide = async (status: Status) => {
    await apiSend(`/community/moderation/posts/${item._id}`, "PATCH", { status, reason }, token);
    setReason("");
    onDone();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="subtitle2">
            {item.author?.displayName ?? "Membre supprimé"} ({item.author?.email}) · {formatDate(item.createdAt)} · {item.kind}
          </Typography>
          <Chip size="small" color={item.status === "masque" ? "error" : "success"} label={item.status === "masque" ? "Masquée" : "En ligne"} />
        </Stack>
        {item.title && (
          <Typography variant="h6" sx={{ mt: 1 }}>
            {item.title}
          </Typography>
        )}
        <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>{item.text}</Typography>
        {item.image?.url && (
          <Box component="img" src={mediaUrl(item.image.url)} alt="" sx={{ mt: 2, maxHeight: 200, borderRadius: 2 }} />
        )}
        <Reports reports={item.reports} />
        {item.moderation?.reason && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Dernière décision : {item.moderation.reason}
            {item.moderation.by && ` (${item.moderation.by.firstName} ${item.moderation.by.lastName})`}
          </Typography>
        )}
        <TextField
          label="Motif de la décision (obligatoire)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
        />
      </CardContent>
      <CardActions>
        <Button component={RouterLink} to={`/communaute/publication/${item._id}`} disabled={item.status === "masque"}>
          Voir sur le site
        </Button>
        {item.status === "publie" ? (
          <Button color="error" disabled={reason.trim().length < 3} onClick={() => decide("masque")}>
            Masquer
          </Button>
        ) : null}
        <Button color="success" disabled={reason.trim().length < 3} onClick={() => decide("publie")}>
          {item.status === "masque" ? "Remettre en ligne" : "Conserver (effacer les signalements)"}
        </Button>
      </CardActions>
    </Card>
  );
};

const CommentModeration = ({ item, token, onDone }: { item: ModeratedComment; token: string | null; onDone: () => void }) => {
  const decide = async (status: Status) => {
    await apiSend(`/community/moderation/comments/${item._id}`, "PATCH", { status }, token);
    onDone();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
          <Typography variant="subtitle2">
            {item.author?.displayName ?? "Membre supprimé"} ({item.author?.email}) · {formatDate(item.createdAt)}
          </Typography>
          <Chip size="small" color={item.status === "masque" ? "error" : "success"} label={item.status === "masque" ? "Masqué" : "En ligne"} />
        </Stack>
        {item.post && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sous la publication : {item.post.title || item.post.text.slice(0, 80)}
          </Typography>
        )}
        <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>{item.text}</Typography>
        <Reports reports={item.reports} />
      </CardContent>
      <CardActions>
        {item.status === "publie" && (
          <Button color="error" onClick={() => decide("masque")}>
            Masquer
          </Button>
        )}
        <Button color="success" onClick={() => decide("publie")}>
          {item.status === "masque" ? "Remettre en ligne" : "Conserver (effacer les signalements)"}
        </Button>
      </CardActions>
    </Card>
  );
};

const MembersTable = ({ token }: { token: string | null }) => {
  const { data, loading, error, reload } = useApi<ModeratedMember[]>("/community/moderation/members", token);
  const toggle = async (member: ModeratedMember) => {
    const action = member.suspended ? "réactiver" : "suspendre";
    if (!window.confirm(`Voulez-vous ${action} le compte de ${member.displayName} ?`)) return;
    await apiSend(`/community/moderation/members/${member._id}`, "PATCH", { suspended: !member.suspended }, token);
    reload();
  };

  return (
    <>
      <PageState loading={loading} error={error} />
      {data && (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Membre</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Profil</TableCell>
                <TableCell align="right">Publications</TableCell>
                <TableCell>Inscription</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <RouterLink to={`/communaute/membres/${member._id}`}>{member.displayName}</RouterLink>
                    {member.suspended && <Chip size="small" color="error" label="Suspendu" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.profile}</TableCell>
                  <TableCell align="right">{member.postCount}</TableCell>
                  <TableCell>{new Date(member.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <Button size="small" color={member.suspended ? "success" : "error"} onClick={() => toggle(member)}>
                      {member.suspended ? "Réactiver" : "Suspendre"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );
};

// Modération de « la communauté du fort »
const AdminCommunityPage = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState<"posts" | "comments" | "members">("posts");
  const [filter, setFilter] = useState<Filter>("reported");

  const posts = useApi<ModeratedPost[]>(tab === "posts" ? `/community/moderation/posts?filter=${filter}` : null, token);
  const comments = useApi<ModeratedComment[]>(tab === "comments" ? `/community/moderation/comments?filter=${filter}` : null, token);
  const current = tab === "posts" ? posts : comments;

  return (
    <AdminPage title="Communauté du fort" lead="Les membres signalent un contenu, l'équipe décide de le masquer ou de le garder.">
      <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab value="posts" label="Publications" />
        <Tab value="comments" label="Commentaires" />
        <Tab value="members" label="Membres" />
      </Tabs>

      {tab === "members" ? (
        <MembersTable token={token} />
      ) : (
        <>
          <div className="mb-6">
            <FilterPills
              label="Filtre"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "reported", label: "Signalés" },
                { value: "hidden", label: "Masqués" },
                { value: "all", label: "Tous" },
              ]}
            />
          </div>

          <PageState loading={current.loading} error={current.error} />
          {current.data && current.data.length === 0 && <Typography>Rien à traiter pour le moment.</Typography>}

          <Box sx={{ display: "grid", gap: 2 }}>
            {tab === "posts" &&
              posts.data?.map((item) => <PostModeration key={item._id} item={item} token={token} onDone={posts.reload} />)}
            {tab === "comments" &&
              comments.data?.map((item) => <CommentModeration key={item._id} item={item} token={token} onDone={comments.reload} />)}
          </Box>
        </>
      )}
    </AdminPage>
  );
};

export default AdminCommunityPage;
