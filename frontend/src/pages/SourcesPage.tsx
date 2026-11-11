import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReliabilityBadge from "../components/ReliabilityBadge";
import Reveal from "../components/Reveal";
import { Container, Page, PageHeader, SectionHeading } from "../components/ui";
import { RELIABILITY_LEVELS } from "../types/common";

// Explique au public les règles du mémorial : fiabilité, validation, IA
const SourcesPage = () => {
  const { t } = useTranslation();
  const steps = ["1", "2", "3", "4"];

  return (
    <Page>
      <PageHeader eyebrow={t("sources.eyebrow")} title={t("sources.title")} lead={t("sources.intro")} />

      <Container className="space-y-20 py-16">
        <section id="fiabilite" aria-labelledby="reliability-title" className="scroll-mt-24">
          <Reveal>
            <SectionHeading id="reliability-title" title={t("sources.reliabilityTitle")} lead={t("sources.reliabilityLead")} />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RELIABILITY_LEVELS.map((level, index) => (
              <Reveal key={level} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-line bg-card p-6">
                  <ReliabilityBadge level={level} />
                  <p className="mt-4 leading-relaxed text-ink-soft">{t(`reliability.${level}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section aria-labelledby="validation-title">
          <Reveal>
            <SectionHeading id="validation-title" title={t("sources.validationTitle")} lead={t("sources.validationText")} />
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step} delay={index * 0.1}>
                <li className="relative h-full rounded-2xl border border-line bg-card p-6">
                  <span className="font-display text-5xl text-accent/30">{step}</span>
                  <p className="mt-2 text-ink">{t(`sources.steps.${step}`)}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        <Reveal>
          <section aria-labelledby="ai-title" className="relative overflow-hidden rounded-3xl border border-line bg-paper-2 p-8 text-ink sm:p-12">
            <Sparkles className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 id="ai-title" className="mt-5 font-display text-3xl sm:text-4xl">
              {t("sources.aiTitle")}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("sources.aiText")}</p>
          </section>
        </Reveal>
      </Container>
    </Page>
  );
};

export default SourcesPage;
