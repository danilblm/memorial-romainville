import { CalendarClock, Route, UserRound, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Testimony } from "../types/Testimony";
import { formatFuzzyDate, localize } from "../utils/localize";

// Cartouche d'archive affiché AVANT chaque témoignage : qui parle, pour qui, depuis quand, par quel chemin
const TestimonyContext = ({ testimony }: { testimony: Testimony }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const path = [
    testimony.collectedBy && `${t("testimony.collectedBy")} : ${testimony.collectedBy}`,
    testimony.transformations && `${t("testimony.transformations")} : ${testimony.transformations}`,
    testimony.originalLocation && `${t("testimony.originalLocation")} : ${testimony.originalLocation}`,
  ].filter(Boolean);

  const rows = [
    {
      icon: UserRound,
      label: t("testimony.who"),
      value: `${testimony.witnessName} (${testimony.witnessRelation}) – ${
        testimony.livedEvents ? t("testimony.lived") : t("testimony.notLived")
      }`,
    },
    { icon: Users, label: t("testimony.forWhom"), value: localize(testimony.audience, lang) || "—" },
    { icon: CalendarClock, label: t("testimony.when"), value: formatFuzzyDate(testimony.recordedAt, lang) },
    { icon: Route, label: t("testimony.path"), value: path.length ? path.join(" · ") : "—" },
  ];

  return (
    <section
      aria-labelledby="testimony-context-title"
      className="relative overflow-hidden rounded-2xl border border-line bg-paper-2/70 p-6 sm:p-8"
    >
      <h2 id="testimony-context-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {t("testimony.contextTitle")}
      </h2>
      <dl className="mt-5 grid gap-6 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <Icon className="mt-1 h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />
            <div>
              <dt className="font-display text-lg text-ink">{label}</dt>
              <dd className="mt-1 text-ink-soft">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default TestimonyContext;
