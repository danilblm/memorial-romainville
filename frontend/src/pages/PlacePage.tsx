import { ArrowLeft, ArrowRight, Maximize2, Mic } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import BeforeAfter from "../components/BeforeAfter";
import ClaimList from "../components/ClaimList";
import MissingInfo from "../components/MissingInfo";
import PageState from "../components/PageState";
import PhotoViewer from "../components/PhotoViewer";
import Reveal from "../components/Reveal";
import SourceList from "../components/SourceList";
import { Card, CardTitle, Container, Eyebrow, Page, Tag } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { Place } from "../types/Place";
import { formatFuzzyDate, localize } from "../utils/localize";
import { mediaUrl } from "../utils/mediaUrl";
import { findComparison, toViewerPhotos } from "../utils/photos";

const PlacePage = () => {
  const { code } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: place, loading, error } = useApi<Place>(`/places/${code}`);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!place) {
    return (
      <Container className="py-12">
        <PageState loading={loading} error={error} />
      </Container>
    );
  }

  const currentState = localize(place.currentState, lang);
  const photos = place.photos ?? [];
  const comparison = findComparison(photos);

  return (
    <Page>
      <header className="grain bg-night text-on-night">
        <Container className="py-12 sm:py-16">
          <Link to="/carte" className="inline-flex items-center gap-2 text-sm font-medium text-on-night-soft hover:text-on-night">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("place.backToMap")}
          </Link>
          <Eyebrow className="mt-8 text-gold">{t(`place.kinds.${place.kind ?? "autre"}`)}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">{localize(place.name, lang)}</h1>
          {localize(place.description, lang) && (
            <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-on-night-soft">
              {localize(place.description, lang)}
            </p>
          )}
        </Container>
      </header>

      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-10">
          {comparison && (
            <Reveal>
              <section>
                <h2 className="font-display text-3xl text-ink">{t("place.beforeAfter")}</h2>
                <div className="mt-5">
                  <BeforeAfter
                    before={{
                      url: mediaUrl(comparison.before.url) ?? comparison.before.url,
                      caption: localize(comparison.before.caption, lang),
                      dateLabel: comparison.before.dateLabel,
                    }}
                    after={{
                      url: mediaUrl(comparison.after.url) ?? comparison.after.url,
                      caption: localize(comparison.after.caption, lang),
                      dateLabel: comparison.after.dateLabel,
                    }}
                  />
                </div>
              </section>
            </Reveal>
          )}

          {currentState && (
            <Reveal>
              <Card>
                <CardTitle>{t("place.currentState")}</CardTitle>
                <p className="mt-3 leading-relaxed text-ink-soft">{currentState}</p>
              </Card>
            </Reveal>
          )}

          {photos.length > 0 && (
            <Reveal>
              <section>
                <h2 className="font-display text-3xl text-ink">{t("place.photos")}</h2>
                <p className="mt-1 text-sm text-ink-soft">{t("place.photosHint")}</p>
                <div className="mt-5 columns-1 gap-4 sm:columns-2">
                  {photos.map((photo, index) => (
                    <figure key={photo._id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-card">
                      <button
                        type="button"
                        onClick={() => setViewerIndex(index)}
                        className="group relative block w-full"
                        aria-label={`${t("viewer.open")} : ${localize(photo.caption, lang) || t("viewer.photo")}`}
                      >
                        <img
                          src={mediaUrl(photo.url)}
                          alt={localize(photo.caption, lang)}
                          loading="lazy"
                          className="w-full transition duration-500 group-hover:scale-[1.03]"
                        />
                        <span className="absolute right-3 bottom-3 rounded-full bg-night/75 p-2 text-on-night opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                          <Maximize2 className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {photo.era && photo.era !== "inconnue" && (
                          <span className="absolute top-3 left-3 rounded-full bg-night/80 px-2.5 py-1 text-xs font-semibold text-on-night">
                            {t(`place.eras.${photo.era}`)}
                            {photo.dateLabel && ` · ${photo.dateLabel}`}
                          </span>
                        )}
                      </button>
                      {localize(photo.caption, lang) && (
                        <figcaption className="p-3 text-sm text-ink-soft">{localize(photo.caption, lang)}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {place.claims && place.claims.length > 0 && (
            <Reveal>
              <Card>
                <CardTitle>{t("person.claims")}</CardTitle>
                <div className="mt-5">
                  <ClaimList claims={place.claims} />
                </div>
              </Card>
            </Reveal>
          )}

          <Reveal>
            <MissingInfo items={place.missingInfo} />
          </Reveal>

          {place.testimonies && place.testimonies.length > 0 && (
            <Reveal>
              <section>
                <h2 className="font-display text-3xl text-ink">{t("person.testimonies")}</h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {place.testimonies.map((testimony) => (
                    <li key={testimony._id}>
                      <Link
                        to={`/temoignages/${testimony._id}`}
                        className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-5 transition hover:shadow-lg"
                      >
                        <Mic className="h-5 w-5 text-accent" aria-hidden="true" />
                        <span className="flex-1">
                          <span className="block font-display text-lg text-ink">{testimony.witnessName}</span>
                          <span className="text-sm text-ink-soft">{formatFuzzyDate(testimony.recordedAt, lang)}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {place.persons && place.persons.length > 0 && (
            <Card>
              <CardTitle className="text-lg">{t("place.persons")}</CardTitle>
              <div className="mt-4 flex flex-wrap gap-2">
                {place.persons.map((person) => (
                  <Tag key={person._id} to={`/personnes/${person._id}`}>
                    {person.displayName}
                  </Tag>
                ))}
              </div>
            </Card>
          )}
          {place.sources && place.sources.length > 0 && (
            <Card>
              <CardTitle className="text-lg">{t("person.sources")}</CardTitle>
              <div className="mt-4">
                <SourceList sources={place.sources} />
              </div>
            </Card>
          )}
        </aside>
      </Container>

      <PhotoViewer photos={toViewerPhotos(photos, lang, t)} index={viewerIndex} onIndexChange={setViewerIndex} />
    </Page>
  );
};

export default PlacePage;
