import { Alert, Box, Chip, Container, Link, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import MediaPlayer from "../components/MediaPlayer";
import PageState from "../components/PageState";
import SourceList from "../components/SourceList";
import TestimonyContext from "../components/TestimonyContext";
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
      <Container sx={{ py: 4 }}>
        <PageState loading={loading} error={error} />
      </Container>
    );
  }

  const notCovered = localize(testimony.notCovered, lang);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {testimony.witnessName}
      </Typography>

      {/* Le contexte vient toujours avant le récit */}
      <TestimonyContext testimony={testimony} />

      {testimony.isExcerpt && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          {t("testimony.excerpt")}{" "}
          {testimony.fullVersionUrl && (
            <Link href={testimony.fullVersionUrl} target="_blank" rel="noopener noreferrer">
              {t("testimony.fullVersion")}
            </Link>
          )}
        </Alert>
      )}

      <MediaPlayer
        medium={testimony.medium}
        url={testimony.mediaUrl}
        transcript={localize(testimony.transcript, lang)}
      />

      {notCovered && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2">
            {t("testimony.notCovered")}
          </Typography>
          <Typography>{notCovered}</Typography>
        </Box>
      )}

      {testimony.persons && testimony.persons.length > 0 && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t("testimony.about")}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {testimony.persons.map((person) => (
              <Chip
                key={person._id}
                label={person.displayName}
                component={RouterLink}
                to={`/personnes/${person._id}`}
                clickable
              />
            ))}
          </Stack>
        </Box>
      )}

      {testimony.sources && testimony.sources.length > 0 && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2">
            {t("person.sources")}
          </Typography>
          <SourceList sources={testimony.sources} />
        </Box>
      )}
    </Container>
  );
};

export default TestimonyPage;
