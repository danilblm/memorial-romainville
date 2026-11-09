import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowRight, Building2, DoorClosed, LandPlot, MapPin } from "lucide-react";
import { useState } from "react";
import { CircleMarker, ImageOverlay, MapContainer, Tooltip } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import PageState from "../components/PageState";
import { Container, Page, PageHeader } from "../components/ui";
import { PLAN_HEIGHT, PLAN_URL, PLAN_WIDTH } from "../constants/plan";
import { useApi } from "../hooks/useApi";
import { PlaceSummary } from "../types/Place";
import { cn } from "../utils/cn";
import { localize } from "../utils/localize";

// Les positions des lieux sont en pixels du plan, origine en haut à gauche.
const BOUNDS: L.LatLngBoundsExpression = [
  [0, 0],
  [PLAN_HEIGHT, PLAN_WIDTH],
];

const KIND_ICONS = { casemate: DoorClosed, cour: LandPlot, batiment: Building2, autre: MapPin } as const;

// Leaflet dessine en SVG avec des attributs : on lit la vraie couleur des variables CSS
const cssColor = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const MapPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: places, loading, error } = useApi<PlaceSummary[]>("/places");
  const [hovered, setHovered] = useState<string | null>(null);

  const placed = (places ?? []).filter((place) => place.position?.x != null && place.position?.y != null);
  const accent = cssColor("--accent", "#9a3a22");
  const gold = cssColor("--gold", "#c99a52");

  return (
    <Page>
      <PageHeader eyebrow={t("map.eyebrow")} title={t("map.title")} lead={t("map.help")} />

      <Container className="py-12">
        <PageState loading={loading} error={error} />

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="relative h-[24rem] overflow-hidden rounded-3xl border border-line shadow-sm sm:h-[34rem]">
            <MapContainer
              crs={L.CRS.Simple}
              bounds={BOUNDS}
              maxBounds={BOUNDS}
              minZoom={-1}
              maxZoom={2}
              className="h-full w-full"
              attributionControl={false}
            >
              <ImageOverlay url={PLAN_URL} bounds={BOUNDS} />
              {placed.map((place) => {
                const isHovered = hovered === place.code;
                return (
                  <CircleMarker
                    key={`${place._id}-${isHovered}`}
                    center={[PLAN_HEIGHT - (place.position?.y ?? 0), place.position?.x ?? 0]}
                    radius={isHovered ? 18 : 12}
                    pathOptions={{ color: isHovered ? gold : accent, fillColor: accent, weight: 3, fillOpacity: 0.55 }}
                    eventHandlers={{
                      click: () => navigate(`/lieux/${place.code}`),
                      mouseover: () => setHovered(place.code),
                      mouseout: () => setHovered(null),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      {localize(place.name, i18n.language)}
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
            <span className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full bg-night/80 px-3 py-1 text-xs text-on-night">
              {t("map.planNote")}
            </span>
          </div>

          {/* Liste équivalente, utilisable au clavier et au lecteur d'écran */}
          {places && (
            <section aria-labelledby="places-title">
              <h2 id="places-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                {t("map.list")}
              </h2>
              <ul className="mt-4 space-y-3">
                {places.map((place) => {
                  const Icon = KIND_ICONS[(place.kind as keyof typeof KIND_ICONS) ?? "autre"] ?? MapPin;
                  return (
                    <li key={place._id}>
                      <Link
                        to={`/lieux/${place.code}`}
                        onMouseEnter={() => setHovered(place.code)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(place.code)}
                        onBlur={() => setHovered(null)}
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl border bg-card p-4 transition",
                          hovered === place.code ? "border-accent shadow-lg" : "border-line hover:border-ink/30"
                        )}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-display text-lg text-ink">{localize(place.name, i18n.language)}</span>
                          <span className="text-sm text-ink-soft">{t(`place.kinds.${place.kind ?? "autre"}`)}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-ink-soft transition group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </Container>
    </Page>
  );
};

export default MapPage;
