import { ArrowLeft, ArrowRight, CircleDashed, Hourglass, MapPin, Mic } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ClaimList from "../components/ClaimList";
import MissingInfo from "../components/MissingInfo";
import PageState from "../components/PageState";
import Reveal from "../components/Reveal";
import SourceList from "../components/SourceList";
import { Card, CardTitle, Container, Page, Tag } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { Person } from "../types/Person";
import { formatFuzzyDate, localize } from "../utils/localize";
import { mediaUrl } from "../utils/mediaUrl";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

const BackLink = ({ children }: { children: ReactNode }) => (
  <Link to="/#arbre" className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink">
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    {children}
  </Link>
);

const PersonPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: person, loading, error } = useApi<Person>(`/persons/${id}`);

  if (!person) {
    return (
      <Container className="py-12">
        <PageState loading={loading} error={error} />
      </Container>
    );
  }

  // Fiche en vérification : on annonce la femme, sans rien publier de ce qui n'est pas validé
  if (person.status && person.status !== "valide") {
    return (
      <Page>
        <Container className="py-12">
          <BackLink>{t("person.back")}</BackLink>
          <div className="mx-auto mt-16 max-w-xl text-center">
            <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-accent bg-[repeating-linear-gradient(45deg,var(--accent-soft)_0_4px,transparent_4px_8px)]">
              <Hourglass className="h-10 w-10 text-accent" aria-hidden="true" />
            </span>
            <h1 className="mt-8 font-display text-5xl text-ink">{person.displayName}</h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{t("person.pendingTitle")}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {t("person.arrival")} : {formatFuzzyDate(person.arrivalAtFort, lang)}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{t("person.pendingText", { name: person.displayName })}</p>
          </div>
        </Container>
      </Page>
    );
  }

  // Refus d'exposition : on dit la présence, on respecte le silence
  if (person.publication?.visibility === "reservee") {
    return (
      <Page>
        <Container className="py-12">
          <BackLink>{t("person.back")}</BackLink>
          <div className="mx-auto mt-16 max-w-xl text-center">
            <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-accent/60">
              <CircleDashed className="h-10 w-10 text-accent/70" aria-hidden="true" />
            </span>
            <h1 className="mt-8 font-display text-5xl text-ink">{person.displayName}</h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{t("person.reservedTitle")}</p>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              {localize(person.publication.note, lang) || t("person.reservedDefault")}
            </p>
          </div>
        </Container>
      </Page>
    );
  }

  const facts = [
    { label: t("person.arrival"), value: formatFuzzyDate(person.arrivalAtFort, lang) },
    person.departureFromFort && { label: t("person.departure"), value: formatFuzzyDate(person.departureFromFort, lang) },
    person.birth?.date && { label: t("person.birth"), value: formatFuzzyDate(person.birth, lang) },
    person.death?.date && { label: t("person.death"), value: formatFuzzyDate(person.death, lang) },
  ].filter(Boolean) as { label: string; value: string }[];

  const biography = localize(person.biography, lang);

  return (
    <Page>
      <header className="border-b border-line bg-paper-2/60">
        <Container className="py-10 sm:py-14">
          <BackLink>{t("person.back")}</BackLink>
          <div className="mt-8 grid items-center gap-8 md:grid-cols-[auto_1fr]">
            {person.photo ? (
              <img
                src={mediaUrl(person.photo)}
                alt=""
                className="h-40 w-40 rounded-3xl object-cover shadow-xl ring-4 ring-card grayscale-[30%]"
              />
            ) : (
              <span
                className="flex h-40 w-40 items-center justify-center rounded-3xl bg-accent-soft font-display text-5xl text-accent ring-4 ring-card"
                aria-hidden="true"
              >
                {initials(person.displayName)}
              </span>
            )}
            <div>
              <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">{person.displayName}</h1>
              {person.nameVariants && person.nameVariants.length > 0 && (
                <p className="mt-2 text-ink-soft">{person.nameVariants.join(" · ")}</p>
              )}
              {person.roles && person.roles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {person.roles.map((role) => (
                    <Tag key={role} className="capitalize">
                      {role}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-2xl border border-line bg-card px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft">{fact.label}</dt>
                <dd className="mt-1 font-display text-xl text-ink first-letter:uppercase">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </header>

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {biography && (
            <Reveal>
              <section>
                <h2 className="font-display text-3xl text-ink">{t("person.biography")}</h2>
                <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink-soft">{biography}</p>
              </section>
            </Reveal>
          )}

          {person.claims && person.claims.length > 0 && (
            <Reveal>
              <Card>
                <CardTitle>{t("person.claims")}</CardTitle>
                <div className="mt-5">
                  <ClaimList claims={person.claims} />
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal>
            <MissingInfo items={person.missingInfo} />
          </Reveal>

          {person.testimonies && person.testimonies.length > 0 && (
            <Reveal>
              <section>
                <h2 className="font-display text-3xl text-ink">{t("person.testimonies")}</h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {person.testimonies.map((testimony) => (
                    <li key={testimony._id}>
                      <Link
                        to={`/temoignages/${testimony._id}`}
                        className="group flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <Mic className="h-5 w-5 text-accent" aria-hidden="true" />
                        <p className="mt-3 font-display text-xl text-ink">{testimony.witnessName}</p>
                        <p className="text-sm text-ink-soft">
                          {testimony.witnessRelation} · {formatFuzzyDate(testimony.recordedAt, lang)}
                        </p>
                        <ArrowRight
                          className="mt-auto h-4 w-4 pt-0 text-ink transition group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {person.places && person.places.length > 0 && (
            <Card>
              <CardTitle className="text-lg">{t("person.places")}</CardTitle>
              <div className="mt-4 flex flex-wrap gap-2">
                {person.places.map((place) => (
                  <Tag key={place._id} to={`/lieux/${place.code}`}>
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {localize(place.name, lang)}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {person.sources && person.sources.length > 0 && (
            <Card>
              <CardTitle className="text-lg">{t("person.sources")}</CardTitle>
              <div className="mt-4">
                <SourceList sources={person.sources} />
              </div>
            </Card>
          )}

          <div className="rounded-2xl border border-line bg-paper-2 p-6 text-ink">
            <p className="font-display text-lg">{t("person.contributeHint")}</p>
            <Link to="/contribuer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              {t("person.contributeLink")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </Container>
    </Page>
  );
};

export default PersonPage;
