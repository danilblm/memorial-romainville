import { ChevronRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import AdminPage from "../../components/admin/AdminPage";
import PageState from "../../components/PageState";
import { ButtonLink } from "../../components/ui";
import { getEntityConfig } from "../../constants/adminEntities";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { ValidationStatus } from "../../types/common";
import { cn } from "../../utils/cn";
import NotFoundPage from "../NotFoundPage";

interface Row {
  _id: string;
  label: string;
  status: ValidationStatus;
  updatedAt: string;
}

const STATUSES: ValidationStatus[] = ["propose", "en_verification", "valide", "refuse"];

// Couleur de la pastille de statut
const STATUS_STYLE: Record<ValidationStatus, string> = {
  propose: "bg-paper-2 text-ink-soft",
  en_verification: "bg-amber-100 text-amber-800",
  valide: "bg-emerald-100 text-emerald-800",
  refuse: "bg-red-100 text-red-800",
};

const field =
  "h-11 rounded-full border border-line bg-card px-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15";

const AdminListPage = () => {
  const { entity } = useParams();
  const config = getEntityConfig(entity);
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const [status, setStatus] = useState<ValidationStatus | "">("");
  const [search, setSearch] = useState("");

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search.trim()) query.set("q", search.trim());
  const { data, loading, error } = useApi<Row[]>(config ? `/admin/${entity}?${query}` : null, token);

  if (!config) return <NotFoundPage />;

  return (
    <AdminPage
      title={config.plural}
      action={
        <ButtonLink to={`/admin/${entity}/nouveau`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </ButtonLink>
      }
    >
      {/* Recherche et filtre sur une ligne */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher…"
            className={cn(field, "w-full pl-10")}
          />
        </label>
        <label>
          <span className="sr-only">Statut</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as ValidationStatus | "")} className={cn(field, "w-full sm:w-52")}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        <PageState loading={loading && !data} error={error} />

        {data && data.length === 0 && <p className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-soft">Aucune fiche.</p>}

        {data && data.length > 0 && (
          <>
            <p className="mb-2 text-sm text-ink-soft">{data.length} fiche(s)</p>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line/80 bg-card shadow-soft">
              {data.map((row) => (
                <li key={row._id}>
                  <Link to={`/admin/${entity}/${row._id}`} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-paper-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{row.label || "(sans titre)"}</span>
                      <span className="block text-xs text-ink-soft">
                        Modifiée le {new Date(row.updatedAt).toLocaleDateString(i18n.language)}
                      </span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[row.status])}>
                      {t(`status.${row.status}`)}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AdminPage>
  );
};

export default AdminListPage;
