import { Alert, AlertTitle, Avatar, Box, Chip, Container, Link, List, ListItem, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import ClaimList from "../components/ClaimList";
import MissingInfo from "../components/MissingInfo";
import PageState from "../components/PageState";
import SourceList from "../components/SourceList";
import { useApi } from "../hooks/useApi";
import { Person } from "../types/Person";
import { formatFuzzyDate, localize } from "../utils/localize";
import { mediaUrl } from "../utils/mediaUrl";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box component="section" sx={{ mt: 4 }}>
    <Typography variant="h5" component="h2" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

const PersonPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: person, loading, error } = useApi<Person>(`/persons/${id}`);

  if (!person) {
    return (
      <Container sx={{ py: 4 }}>
        <PageState loading={loading} error={error} />
      </Container>
    );
  }

  // Refus d'exposition : on dit la présence, on respecte le silence
  if (person.publication?.visibility === "reservee") {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {person.displayName}
        </Typography>
        <Alert severity="info" variant="outlined">
          <AlertTitle>{t("person.reservedTitle")}</AlertTitle>
          {localize(person.publication.note, lang) || t("person.reservedDefault")}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ sm: "center" }}>
        {person.photo && (
          <Avatar src={mediaUrl(person.photo)} alt="" sx={{ width: 120, height: 120 }} variant="rounded" />
        )}
        <Box>
          <Typography variant="h3" component="h1">
            {person.displayName}
          </Typography>
          {person.nameVariants && person.nameVariants.length > 0 && (
            <Typography color="text.secondary">{person.nameVariants.join(", ")}</Typography>
          )}
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
            {person.roles?.map((role) => <Chip key={role} label={role} size="small" />)}
          </Stack>
          <Typography sx={{ mt: 1 }}>
            {t("person.arrival")} : {formatFuzzyDate(person.arrivalAtFort, lang)}
            {person.departureFromFort && ` · ${t("person.departure")} : ${formatFuzzyDate(person.departureFromFort, lang)}`}
          </Typography>
        </Box>
      </Stack>

      {person.biography && (
        <Section title={t("person.biography")}>
          <Typography sx={{ maxWidth: 760, whiteSpace: "pre-line" }}>{localize(person.biography, lang)}</Typography>
        </Section>
      )}

      {person.claims && person.claims.length > 0 && (
        <Section title={t("person.claims")}>
          <ClaimList claims={person.claims} />
        </Section>
      )}

      <MissingInfo items={person.missingInfo} />

      {person.testimonies && person.testimonies.length > 0 && (
        <Section title={t("person.testimonies")}>
          <List dense>
            {person.testimonies.map((testimony) => (
              <ListItem key={testimony._id} disableGutters>
                <Link component={RouterLink} to={`/temoignages/${testimony._id}`}>
                  {testimony.witnessName} ({testimony.witnessRelation}) – {formatFuzzyDate(testimony.recordedAt, lang)}
                </Link>
              </ListItem>
            ))}
          </List>
        </Section>
      )}

      {person.places && person.places.length > 0 && (
        <Section title={t("person.places")}>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {person.places.map((place) => (
              <Chip
                key={place._id}
                label={localize(place.name, lang)}
                component={RouterLink}
                to={`/lieux/${place.code}`}
                clickable
              />
            ))}
          </Stack>
        </Section>
      )}

      {person.sources && person.sources.length > 0 && (
        <Section title={t("person.sources")}>
          <SourceList sources={person.sources} />
        </Section>
      )}
    </Container>
  );
};

export default PersonPage;
