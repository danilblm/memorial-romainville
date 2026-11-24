import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Container, Page } from "../ui";

interface AdminPageProps {
  title: string;
  lead?: string;
  back?: { to: string; label: string }; // par défaut : retour à l'accueil de l'administration
  action?: ReactNode; // bouton à droite du titre (ex. « Ajouter »)
  narrow?: boolean; // formulaires courts (mon compte, réglages)
  children: ReactNode;
}

// Mise en page commune à toutes les pages de l'administration :
// lien retour, titre, une phrase d'explication au plus, puis le contenu.
const AdminPage = ({ title, lead, back = { to: "/admin", label: "Administration" }, action, narrow, children }: AdminPageProps) => (
  <Page>
    <Container className={narrow ? "max-w-2xl py-10 sm:py-14" : "max-w-4xl py-10 sm:py-14"}>
      <Link to={back.to} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-accent">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {back.label}
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl tracking-tight text-ink">{title}</h1>
          {lead && <p className="mt-2 max-w-2xl text-ink-soft">{lead}</p>}
        </div>
        {action}
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  </Page>
);

// Filtre en pastilles (« À traiter », « Tous »…) : plus simple qu'une liste déroulante
export const FilterPills = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-2">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={
          value === option.value
            ? "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
            : "rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-ink/40 hover:text-ink"
        }
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default AdminPage;
