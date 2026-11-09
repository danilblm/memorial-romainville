import { Box, Container, Link, List, ListItem, Typography, useTheme } from "@mui/material";
import L from "leaflet";
import { CircleMarker, ImageOverlay, MapContainer, Tooltip } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import PageState from "../components/PageState";
import { PLAN_HEIGHT, PLAN_URL, PLAN_WIDTH } from "../constants/plan";
import { useApi } from "../hooks/useApi";
import { PlaceSummary } from "../types/Place";
import { localize } from "../utils/localize";

// Les positions des lieux sont en pixels du plan, origine en haut à gauche.
const BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [PLAN_HEIGHT, PLAN_WIDTH],
];

const MapPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: places, loading, error } = useApi<PlaceSummary[]>("/places");

  const placed = (places ?? []).filter((place) => place.position?.x != null && place.position?.y != null);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("map.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("map.help")}
      </Typography>

      <PageState loading={loading} error={error} />

      <Box sx={{ height: { xs: 360, md: 560 }, border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
        <MapContainer
          crs={L.CRS.Simple}
          bounds={BOUNDS}
          maxBounds={BOUNDS}
          minZoom={-1}
          maxZoom={2}
          style={{ height: "100%", width: "100%", background: theme.palette.background.default }}
          attributionControl={false}
        >
          <ImageOverlay url={PLAN_URL} bounds={BOUNDS} />
          {placed.map((place) => (
            <CircleMarker
              key={place._id}
              center={[PLAN_HEIGHT - (place.position?.y ?? 0), place.position?.x ?? 0]}
              radius={12}
              pathOptions={{ color: theme.palette.secondary.main, weight: 3, fillOpacity: 0.5 }}
              eventHandlers={{ click: () => navigate(`/lieux/${place.code}`) }}
            >
              <Tooltip direction="top">{localize(place.name, i18n.language)}</Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>

      {/* Liste équivalente, utilisable au clavier et au lecteur d'écran */}
      {places && (
        <Box component="section" sx={{ mt: 3 }}>
          <Typography variant="h6" component="h2">
            {t("map.list")}
          </Typography>
          <List dense>
            {places.map((place) => (
              <ListItem key={place._id} disableGutters>
                <Link component={RouterLink} to={`/lieux/${place.code}`}>
                  {localize(place.name, i18n.language)}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default MapPage;
