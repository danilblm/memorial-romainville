import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import MediaPlayer from "../components/MediaPlayer";
import MissingInfo from "../components/MissingInfo";
import PageState from "../components/PageState";
import Reveal from "../components/Reveal";
import SourceList from "../components/SourceList";
import TestimonyContext from "../components/TestimonyContext";
import { Card, CardTitle, Container, Page, PageHeader, Tag } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { Testimony } from "../types/Testimony";
import { localize } from "../utils/localize";

const TestimonyPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: testimony, loading, error } = useApi<Testimony>(`/testimonies/${id}`);

  if (!testimony) {
    return (
      <Container className="py-12">
        <PageState loading={loading} error={error} />
      </Container>
    );
  }

  const notCovered = localize(testimony.notCovered, lang);

  return (
    <Page>
      <PageHeader eyebrow={t("testimony.eyebrow")} title={testimony.witnessName} lead={testimony.witnessRelation} />

      <Container className="max-w-4xl space-y-8 py-12">
        {/* Le contexte vient toujours avant le récit */}
        <Reveal>
          <TestimonyContext testimony={testimony} />
        </Reveal>

        {testimony.isExcerpt && (
          <div className="flex items-start gap-3 rounded-2xl border border-gold/60 bg-gold/10 p-4 text-ink">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <p>
              {t("testimony.excerpt")}{" "}
              {testimony.fullVersionUrl && (
                <a href={testimony.fullVersionUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  {t("testimony.fullVersion")}
                </a>
              )}
            </p>
          </div>
        )}

        <Reveal>
          <section aria-label={t("testimony.text")}>
            <MediaPlayer medium={testimony.medium} url={testimony.mediaUrl} transcript={localize(testimony.transcript, lang)} />
          </section>
        </Reveal>

        {notCovered && (
          <Reveal>
            <MissingInfo items={[notCovered]} title={t("testimony.notCovered")} />
          </Reveal>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {testimony.persons && testimony.persons.length > 0 && (
            <Card>
              <CardTitle className="text-lg">{t("testimony.about")}</CardTitle>
              <div className="mt-4 flex flex-wrap gap-2">
                {testimony.persons.map((person) => (
                  <Tag key={person._id} to={`/personnes/${person._id}`}>
                    {person.displayName}
                  </Tag>
                ))}
              </div>
            </Card>
          )}
          {testimony.sources && testimony.sources.length > 0 && (
            <Card>
              <CardTitle className="text-lg">{t("person.sources")}</CardTitle>
              <div className="mt-4">
                <SourceList sources={testimony.sources} />
              </div>
            </Card>
          )}
        </div>
      </Container>
    </Page>
  );
};

export default TestimonyPage;
