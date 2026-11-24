import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flag,
  Inbox,
  KeyRound,
  LucideIcon,
  MapPin,
  MessageSquareQuote,
  Settings,
  Users,
  UserRound,
} from "lucide-react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Container, Page } from "../../components/ui";
import { EntityName } from "../../constants/adminEntities";
import { SHOW_COMMUNITY } from "../../constants/features";
import { useAuth } from "../../context/Auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { cn } from "../../utils/cn";

// Accueil de l'administration : une seule page, trois blocs.
// 1. À traiter (ce qui attend une décision), 2. Contenu du mémorial, 3. Équipe.

const CONTENT: { name: EntityName; label: string; hint: string; icon: LucideIcon }[] = [
  { name: "persons", label: "Femmes", hint: "Fiches des internées", icon: UserRound },
  { name: "places", label: "Lieux", hint: "Carte du fort", icon: MapPin },
  { name: "events", label: "Événements", hint: "Frise chronologique", icon: CalendarDays },
  { name: "testimonies", label: "Témoignages", hint: "Récits, audio, vidéo", icon: MessageSquareQuote },
  { name: "sources", label: "Sources", hint: "Archives et documents", icon: BookOpen },
];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-10">
    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
);

// Grande carte « à traiter » avec le nombre d'éléments en attente
const TodoCard = ({ to, icon: Icon, label, count }: { to: string; icon: LucideIcon; label: string; count: number | null }) => {
  const pending = (count ?? 0) > 0;
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
        pending ? "border-accent/50" : "border-line/80"
      )}
    >
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", pending ? "bg-accent text-accent-ink" : "bg-paper-2 text-ink-soft")}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{label}</span>
        <span className={cn("block text-sm", pending ? "font-semibold text-accent" : "text-ink-soft")}>
          {count === null ? "…" : pending ? `${count} en attente` : "Rien à traiter"}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
    </Link>
  );
};

// Ligne simple d'une liste
const Row = ({ to, icon: Icon, label, hint }: { to: string; icon: LucideIcon; label: string; hint: string }) => (
  <li>
    <Link to={to} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-paper-2">
      <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
      <span className="font-medium text-ink">{label}</span>
      <span className="hidden text-sm text-ink-soft sm:inline">— {hint}</span>
      <ChevronRight className="ml-auto h-4 w-4 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
    </Link>
  </li>
);

const List = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line/80 bg-card shadow-soft">{children}</ul>
);

const AdminHomePage = () => {
  const { username, role, token } = useAuth();
  const isAdmin = role === "admin";

  // Compteurs « à traiter »
  const contributions = useApi<unknown[]>("/contributions?status=propose", token);
  const reportedPosts = useApi<unknown[]>(SHOW_COMMUNITY ? "/community/moderation/posts?filter=reported" : null, token);
  const reportedComments = useApi<unknown[]>(SHOW_COMMUNITY ? "/community/moderation/comments?filter=reported" : null, token);

  const contributionCount = contributions.data ? contributions.data.length : contributions.error ? 0 : null;
  const reportCount =
    reportedPosts.data && reportedComments.data
      ? reportedPosts.data.length + reportedComments.data.length
      : reportedPosts.error || reportedComments.error
        ? 0
        : null;

  return (
    <Page>
      <Container className="max-w-3xl py-12 sm:py-16">
        <p className="text-sm text-ink-soft">Bonjour{username ? ` ${username}` : ""}</p>
        <h1 className="mt-1 font-display text-4xl tracking-tight text-ink">Administration</h1>

        <Section title="À traiter">
          <div className="grid gap-3 sm:grid-cols-2">
            <TodoCard to="/admin/contributions" icon={Inbox} label="Contributions du public" count={contributionCount} />
            {SHOW_COMMUNITY && <TodoCard to="/admin/communaute" icon={Flag} label="Signalements communauté" count={reportCount} />}
          </div>
        </Section>

        <Section title="Contenu du mémorial">
          <List>
            {CONTENT.map((item) => (
              <Row key={item.name} to={`/admin/${item.name}`} icon={item.icon} label={item.label} hint={item.hint} />
            ))}
          </List>
        </Section>

        <Section title="Équipe">
          <List>
            {isAdmin && <Row to="/admin/comptes" icon={Users} label="Comptes de l'équipe" hint="Ajouter un membre du groupe" />}
            <Row to="/admin/mon-compte" icon={KeyRound} label="Mon compte" hint="Changer mon mot de passe" />
            {isAdmin && <Row to="/admin/reglages" icon={Settings} label="Réglages" hint="Plan du fort sur la carte" />}
          </List>
        </Section>
      </Container>
    </Page>
  );
};

export default AdminHomePage;
