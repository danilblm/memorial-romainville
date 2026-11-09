import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ClaimList from "../components/ClaimList";
import Dialog from "../components/Dialog";
import PageState from "../components/PageState";
import SourceList from "../components/SourceList";
import { Button, Container, Page, PageHeader, Tag } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { EventItem } from "../types/Event";
import { cn } from "../utils/cn";
import { formatFuzzyDate, localize } from "../utils/localize";

const TimelinePage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [period, setPeriod] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  const { data: periods } = useApi<string[]>("/events/periods");
  const { data: events, loading, error } = useApi<EventItem[]>(
    period ? `/events?period=${encodeURIComponent(period)}` : "/events"
  );

  const current = events && selected !== null ? events[selected] : null;

  return (
    <Page>
      <PageHeader eyebrow={t("timeline.eyebrow")} title={t("timeline.title")} lead={t("timeline.subtitle")}>
        {periods && periods.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label={t("timeline.period")}>
            {["", ...periods].map((value) => (
              <button
                key={value || "all"}
                type="button"
                aria-pressed={period === value}
                onClick={() => {
                  setPeriod(value);
                  setSelected(null);
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  period === value ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-soft hover:text-ink"
                )}
              >
                {value || t("timeline.allPeriods")}
              </button>
            ))}
          </div>
        )}
      </PageHeader>

      <Container className="py-14">
        <PageState loading={loading} error={error} />
        {events && events.length === 0 && <p className="text-center text-ink-soft">{t("timeline.empty")}</p>}

        {events && events.length > 0 && (
          <ol className="relative mx-auto max-w-4xl">
            {/* Ligne du temps */}
            <span className="absolute top-0 bottom-0 left-4 w-px bg-line md:left-1/2" aria-hidden="true" />

            {events.map((item, index) => {
              const right = index % 2 === 1;
              return (
                <motion.li
                  key={item._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                  className="relative mb-10 pl-12 md:grid md:grid-cols-2 md:pl-0"
                >
                  <span
                    className="absolute top-6 left-4 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-paper bg-accent ring-2 ring-accent/30 md:left-1/2"
                    aria-hidden="true"
                  />
                  <div className={cn(right ? "md:col-start-2 md:pl-12" : "md:pr-12 md:text-right")}>
                    <button
                      type="button"
                      onClick={() => setSelected(index)}
                      className="group w-full rounded-2xl border border-line bg-card p-6 text-left transition hover:-translate-y-1 hover:shadow-xl md:text-inherit"
                    >
                      <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent first-letter:uppercase">
                        {formatFuzzyDate(item.start, lang)}
                      </span>
                      <span className="mt-3 block font-display text-2xl text-ink">{localize(item.title, lang)}</span>
                      {localize(item.description, lang) && (
                        <span className="mt-2 line-clamp-2 block text-ink-soft">{localize(item.description, lang)}</span>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink group-hover:text-accent">
                        {t("timeline.open")}
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </Container>

      <Dialog open={Boolean(current)} onClose={() => setSelected(null)} labelledBy="event-title">
        {current && events && selected !== null && (
          <div className="flex max-h-[88dvh] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-line p-6">
              <div>
                <p className="text-sm font-semibold text-accent first-letter:uppercase">{formatFuzzyDate(current.start, lang)}</p>
                <h2 id="event-title" className="mt-1 font-display text-3xl text-ink">
                  {localize(current.title, lang)}
                </h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label={t("timeline.close")} className="rounded-full p-2 hover:bg-ink/5">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-6">
              {localize(current.description, lang) && (
                <p className="whitespace-pre-line leading-relaxed text-ink-soft">{localize(current.description, lang)}</p>
              )}
              {current.claims && <ClaimList claims={current.claims} />}
              {((current.places?.length ?? 0) > 0 || (current.persons?.length ?? 0) > 0) && (
                <div className="flex flex-wrap gap-2">
                  {current.places?.map((place) => (
                    <Tag key={place._id} to={`/lieux/${place.code}`}>
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {localize(place.name, lang)}
                    </Tag>
                  ))}
                  {current.persons?.map((person) => (
                    <Tag key={person._id} to={`/personnes/${person._id}`}>
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                      {person.displayName}
                    </Tag>
                  ))}
                </div>
              )}
              <SourceList sources={current.sources} />
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-line p-4">
              <Button variant="ghost" disabled={selected === 0} onClick={() => setSelected(selected - 1)}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                {t("timeline.previous")}
              </Button>
              <Button variant="ghost" disabled={selected === events.length - 1} onClick={() => setSelected(selected + 1)}>
                {t("timeline.next")}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Page>
  );
};

export default TimelinePage;
