import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, FileText, Music, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../components/Dialog";
import PageState from "../components/PageState";
import Reveal from "../components/Reveal";
import { ButtonLink, Container, Page, PageHeader } from "../components/ui";
import { BASE_URL } from "../constants/baseUrl";
import { useApi } from "../hooks/useApi";
import { PublishedArchive } from "../types/Archive";
import { ContributionTarget } from "../types/Contribution";
import { cn } from "../utils/cn";

const KINDS: ContributionTarget[] = ["person", "place", "event", "source", "autre"];

const fileUrl = (archive: PublishedArchive, index: number) => `${BASE_URL}/contributions/published/${archive._id}/files/${index}`;
const isImage = (mime: string) => mime.startsWith("image/");

// Attendre que la personne ait fini de taper avant d'interroger l'API
const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const ArchiveFiles = ({ archive, large }: { archive: PublishedArchive; large?: boolean }) => {
  const { t } = useTranslation();
  if (archive.files.length === 0) return null;

  return (
    <div className={cn("grid gap-3", large ? "sm:grid-cols-2" : "grid-cols-3")}>
      {archive.files.map((file) =>
        isImage(file.mimeType) ? (
          <a
            key={file.index}
            href={fileUrl(archive, file.index)}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-xl border border-line bg-paper-2"
          >
            <img
              src={fileUrl(archive, file.index)}
              alt={file.originalName}
              loading="lazy"
              className={cn("w-full object-cover transition duration-500 group-hover:scale-105", large ? "max-h-96" : "aspect-square")}
            />
          </a>
        ) : file.mimeType.startsWith("audio/") && large ? (
          <div key={file.index} className="rounded-xl border border-line bg-paper-2 p-4 sm:col-span-2">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <Music className="h-4 w-4 text-accent" aria-hidden="true" />
              {file.originalName}
            </p>
            <audio controls src={fileUrl(archive, file.index)} className="mt-3 w-full" />
          </div>
        ) : (
          <a
            key={file.index}
            href={fileUrl(archive, file.index)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-line bg-paper-2 p-3 text-sm text-ink hover:border-accent hover:text-accent"
            title={t("archives.openFile")}
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{file.originalName}</span>
          </a>
        )
      )}
    </div>
  );
};

const ArchiveMeta = ({ archive }: { archive: PublishedArchive }) => {
  const { t, i18n } = useTranslation();
  return (
    <p className="text-sm text-ink-soft">
      {t("archives.sharedBy", { name: archive.contributor.name })}
      {archive.contributor.relation && ` · ${archive.contributor.relation}`}
      {" · "}
      {new Date(archive.publishedAt).toLocaleDateString(i18n.language, { day: "numeric", month: "long", year: "numeric" })}
    </p>
  );
};

const ArchivesPage = () => {
  const { t } = useTranslation();
  const [kind, setKind] = useState<ContributionTarget | "">("");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const q = useDebounced(search.trim());

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (q) params.set("q", q);
    const query = params.toString();
    return `/contributions/published${query ? `?${query}` : ""}`;
  }, [kind, q]);

  const { data, loading, error } = useApi<PublishedArchive[]>(path);
  const opened = data?.find((item) => item._id === openId) ?? null;

  return (
    <Page>
      <PageHeader eyebrow={t("archives.eyebrow")} title={t("archives.title")} lead={t("archives.intro")}>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5">
            <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            {t("archives.verified")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5">
            <Users className="h-4 w-4 text-accent" aria-hidden="true" />
            {t("archives.consented")}
          </span>
        </div>
      </PageHeader>

      <Container className="py-12">
        {/* Recherche et filtres */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">{t("archives.search")}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("archives.search")}
              className="w-full rounded-full border border-line bg-card py-3 pl-11 pr-4 text-ink placeholder:text-ink-soft/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("archives.filter")}>
            {(["", ...KINDS] as const).map((value) => (
              <button
                key={value || "all"}
                type="button"
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  kind === value ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink hover:border-ink/40"
                )}
              >
                {value ? t(`archives.kinds.${value}`) : t("archives.all")}
              </button>
            ))}
          </div>
        </div>

        <PageState loading={loading && !data} error={error} />

        {data && (
          <p className="mt-8 text-sm text-ink-soft" aria-live="polite">
            {t("archives.count", { count: data.length })}
          </p>
        )}

        {data && data.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-line bg-paper-2 p-12 text-center">
            <p className="font-display text-2xl text-ink">{t("archives.empty")}</p>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">{t("archives.emptyLead")}</p>
            <ButtonLink to="/contribuer" className="mt-6">
              {t("archives.contribute")}
            </ButtonLink>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((archive, index) => (
            <motion.article
              key={archive._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
              className="group flex flex-col rounded-2xl border border-line/80 bg-card p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                  {t(`archives.kinds.${archive.target.kind}`)}
                </span>
                <BadgeCheck className="h-5 w-5 text-accent" aria-label={t("archives.verified")} />
              </div>
              {archive.target.label && (
                <h2 className="mt-4 font-display text-2xl leading-tight tracking-tight text-ink">{archive.target.label}</h2>
              )}
              <p className="mt-3 line-clamp-4 leading-relaxed text-ink-soft">{archive.content}</p>
              {archive.files.length > 0 && (
                <div className="mt-4">
                  <ArchiveFiles archive={archive} />
                </div>
              )}
              <div className="mt-auto pt-6">
                <ArchiveMeta archive={archive} />
                <button
                  type="button"
                  onClick={() => setOpenId(archive._id)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                >
                  {t("archives.read")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Appels à participer */}
        <Reveal>
          <section className="mt-20 grid gap-6 rounded-3xl border border-line bg-paper-2 p-8 sm:p-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl text-ink">{t("archives.ctaTitle")}</h2>
              <p className="mt-3 max-w-md text-ink-soft">{t("archives.ctaLead")}</p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-end">
              <ButtonLink to="/contribuer">{t("archives.contribute")}</ButtonLink>
              <ButtonLink to="/communaute" variant="secondary">
                {t("archives.discuss")}
              </ButtonLink>
            </div>
          </section>
        </Reveal>
      </Container>

      <Dialog open={Boolean(opened)} onClose={() => setOpenId(null)} labelledBy="archive-title" className="w-[min(94vw,52rem)]">
        {opened && (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                {t(`archives.kinds.${opened.target.kind}`)}
              </span>
              <button type="button" onClick={() => setOpenId(null)} aria-label={t("nav.close")} className="rounded-full p-2 hover:bg-ink/5">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <h2 id="archive-title" className="mt-4 font-display text-3xl text-ink">
              {opened.target.label || t(`archives.kinds.${opened.target.kind}`)}
            </h2>
            <div className="mt-2">
              <ArchiveMeta archive={opened} />
            </div>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink">{opened.content}</p>
            <div className="mt-6">
              <ArchiveFiles archive={opened} large />
            </div>
            <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-paper-2 p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink">{t("archives.provenance")}</dt>
                <dd className="mt-1 text-ink-soft">{opened.declaredProvenance}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">{t("archives.status")}</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-ink-soft">
                  <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                  {t("archives.verifiedLong")}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Dialog>
    </Page>
  );
};

export default ArchivesPage;
