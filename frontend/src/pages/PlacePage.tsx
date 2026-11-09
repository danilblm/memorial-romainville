import { Box, Button, Chip, Container, ImageList, ImageListItem, ImageListItemBar, Link, List, ListItem, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import ClaimList from "../components/ClaimList";
import MissingInfo from "../components/MissingInfo";
import PageState from "../components/PageState";
import SourceList from "../components/SourceList";
import { useApi } from "../hooks/useApi";
import { Place } from "../types/Place";
import { formatFuzzyDate, localize } from "../utils/localize";
import { mediaUrl } from "../utils/mediaUrl";

const PlacePage = () => {
  const { code } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: place, loading, error } = useApi<Place>(`/places/${code}`);

  if (!place) {
    return (
      <Container sx={{ py: 4 }}>
        <PageState loading={loading} error={error} />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Button component={RouterLink} to="/carte" sx={{ mb: 2 }}>
        ← {t("place.backToMap")}
      </Button>
      <Typography variant="h3" component="h1" gutterBottom>
        {localize(place.name, lang)}
      </Typography>
      <Typography sx={{ maxWidth: 760, whiteSpace: "pre-line" }}>{localize(place.description, lang)}</Typography>

      {localize(place.currentState, lang) && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2">
            {t("place.currentState")}
          </Typography>
          <Typography>{localize(place.currentState, lang)}</Typography>
        </Box>
      )}

      {place.photos && place.photos.length > 0 && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t("place.photos")}
          </Typography>
          <ImageList cols={3} gap={8}>
            {place.photos.map((photo) => (
              <ImageListItem key={photo._id}>
                <img src={mediaUrl(photo.url)}alt={localize(photo.caption, lang)} loading="lazy" />
                <ImageListItemBar title={localize(photo.caption, lang)} position="below" />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}

      {place.claims && <ClaimList claims={place.claims} />}
      <MissingInfo items={place.missingInfo} />

      {place.persons && place.persons.length > 0 && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {t("place.persons")}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {place.persons.map((person) => (
              <Chip key={person._id} label={person.displayName} component={RouterLink} to={`/personnes/${person._id}`} clickable />
            ))}
          </Stack>
        </Box>
      )}

      {place.testimonies && place.testimonies.length > 0 && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2">
            {t("person.testimonies")}
          </Typography>
          <List dense>
            {place.testimonies.map((testimony) => (
              <ListItem key={testimony._id} disableGutters>
                <Link component={RouterLink} to={`/temoignages/${testimony._id}`}>
                  {testimony.witnessName} – {formatFuzzyDate(testimony.recordedAt, lang)}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {place.sources && place.sources.length > 0 && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2">
            {t("person.sources")}
          </Typography>
          <SourceList sources={place.sources} />
        </Box>
      )}
    </Container>
  );
};

export default PlacePage;
