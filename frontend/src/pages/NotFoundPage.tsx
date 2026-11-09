import { useTranslation } from "react-i18next";
import { ButtonLink, Container, Page } from "../components/ui";

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <Page>
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-8xl text-accent/30">404</p>
        <h1 className="mt-4 font-display text-4xl text-ink">{t("common.notFound")}</h1>
        <p className="mt-3 text-ink-soft">{t("common.notFoundLead")}</p>
        <ButtonLink to="/" className="mt-8">
          {t("common.back")}
        </ButtonLink>
      </Container>
    </Page>
  );
};

export default NotFoundPage;
