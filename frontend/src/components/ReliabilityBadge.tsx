import { BadgeCheck, CircleHelp, CircleOff, FileText, LucideIcon, MessagesSquare, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Reliability } from "../types/common";
import { cn } from "../utils/cn";

// Icône + mot : le niveau ne repose jamais sur la seule couleur (daltonisme)
const LEVELS: Record<Reliability, { icon: LucideIcon; tone: string }> = {
  documentee: { icon: FileText, tone: "border-leaf/50 text-leaf" },
  recoupee: { icon: BadgeCheck, tone: "border-leaf/50 text-leaf" },
  temoignee: { icon: Mic, tone: "border-ink/30 text-ink" },
  transmise: { icon: MessagesSquare, tone: "border-ink/30 text-ink" },
  incertaine: { icon: CircleHelp, tone: "border-accent/50 text-accent" },
  inconnue: { icon: CircleOff, tone: "border-ink/30 text-ink-soft" },
};

const ReliabilityBadge = ({ level }: { level: Reliability }) => {
  const { t } = useTranslation();
  const { icon: Icon, tone } = LEVELS[level];

  return (
    <Link
      to="/nos-sources#fiabilite"
      title={t(`reliability.${level}.desc`)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-semibold transition hover:shadow-sm",
        tone
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {t(`reliability.${level}.label`)}
    </Link>
  );
};

export default ReliabilityBadge;
