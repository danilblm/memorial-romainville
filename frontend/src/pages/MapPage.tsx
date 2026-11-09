import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronsLeftRight,
  CircleDashed,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  DoorClosed,
  Footprints,
  Image as ImageIcon,
  LandPlot,
  Layers,
  MapPin,
  Mic,
  Satellite,
  Square,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageOverlay, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PageState from "../components/PageState";
import PhotoViewer from "../components/PhotoViewer";
import ReliabilityBadge from "../components/ReliabilityBadge";
import { Container, Page, PageHeader } from "../components/ui";
import { FORT_CENTER, FORT_ZOOM, SATELLITE_ATTRIBUTION, SATELLITE_TILES } from "../constants/geo";
import { useApi } from "../hooks/useApi";
import { usePlan } from "../hooks/usePlan";
import { Place, PlaceSummary } from "../types/Place";
import { cn } from "../utils/cn";
import { localize } from "../utils/localize";
import { mediaUrl } from "../utils/mediaUrl";
import { findComparison, toViewerPhotos } from "../utils/photos";

type Mode = "plan" | "real";

const KIND_ICONS = { casemate: DoorClosed, cour: LandPlot, batiment: Building2, autre: MapPin } as const;
type Kind = keyof typeof KIND_ICONS;

const kindOf = (place: PlaceSummary): Kind =>
  place.kind && place.kind in KIND_ICONS ? (place.kind as Kind) : "autre";

// Coordonnées d'un lieu dans la vue choisie (null s'il n'y est pas encore placé)
const coordsOf = (place: PlaceSummary, mode: Mode, planHeight: number): [number, number] | null => {
  if (mode === "plan") {
    const { x, y } = place.position ?? {};
    return x != null && y != null ? [planHeight - y, x] : null;
  }
  const { lat, lng } = place.geo ?? {};
  return lat != null && lng != null ? [lat, lng] : null;
};

const pinIcon = (number: number, selected: boolean, hovered: boolean) =>
  L.divIcon({
    className: "",
    html: `<span class="map-pin${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}">${number}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const fortIcon = (label: string) =>
  L.divIcon({ className: "", html: `<span class="fort-pin">${label}</span>`, iconSize: [0, 0] });

// Déplace la vue vers le lieu sélectionné
const FlyTo = ({ target, zoom }: { target: [number, number] | null; zoom?: number }) => {
  const map = useMap();
  const lat = target?.[0];
  const lng = target?.[1];
  useEffect(() => {
    if (lat == null || lng == null) return;
    map.flyTo([lat, lng], zoom ?? Math.max(map.getZoom(), 0), { duration: 0.9 });
  }, [lat, lng, zoom, map]);
  return null;
};

// Aperçu d'un lieu, sans quitter la carte
const PlacePreview = ({ code, onClose }: { code: string; onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const { data: place, loading } = useApi<Place>(`/places/${code}`);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const lang = i18n.language;

  if (loading || !place) {
    return (
      <div className="space-y-3 p-6" aria-busy="true">
        <div className="h-40 animate-pulse rounded-xl bg-paper-2" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-paper-2" />
        <div className="h-4 w-full animate-pulse rounded bg-paper-2" />
      </div>
    );
  }

  const photos = place.photos ?? [];
  const photo = photos[0];
  const description = localize(place.description, lang);
  const persons = place.persons ?? [];
  const testimonies = place.testimonies ?? [];
  const claims = place.claims ?? [];
  const missing = place.missingInfo ?? [];
  const sources = place.sources ?? [];
  const comparison = findComparison(photos);

  return (
    <div className="max-h-[36rem] overflow-y-auto">
      <div className="relative h-44 overflow-hidden bg-night">
        {photo ? (
          <button type="button" onClick={() => setViewerIndex(0)} className="group block h-full w-full" aria-label={t("viewer.open")}>
            <img
              src={mediaUrl(photo.url)}
              alt={localize(photo.caption, lang)}
              className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-night/80 px-3 py-1 text-xs font-semibold text-on-night">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("map.photos", { count: photos.length })}
            </span>
          </button>
        ) : (
          <div className="grain flex h-full items-center justify-center text-on-night-soft">
            <ImageIcon className="h-10 w-10 opacity-50" aria-hidden="true" />
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={t("nav.close")}
          className="absolute top-3 right-3 rounded-full bg-night/70 p-2 text-on-night hover:bg-night"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{t(`place.kinds.${kindOf(place)}`)}</p>
        <h2 className="mt-2 font-display text-3xl text-ink">{localize(place.name, lang)}</h2>
        {description && <p className="mt-3 line-clamp-4 leading-relaxed text-ink-soft">{description}</p>}

        {/* Ce que disent les sources, avec leur fiabilité */}
        {claims.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-soft">{t("person.claims")}</p>
            <ul className="mt-2 space-y-2">
              {claims.slice(0, 3).map((claim) => (
                <li key={claim._id} className="flex items-start justify-between gap-2 text-sm">
                  <span className="text-ink">{localize(claim.value, lang)}</span>
                  <ReliabilityBadge level={claim.reliability} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {missing.length > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-line p-3 text-sm text-ink-soft">
            <CircleDashed className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold text-ink">{t("missing.title")} : </span>
              {missing.map((item) => localize(item, lang)).filter(Boolean).join(" · ")}
            </span>
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound className="h-4 w-4" aria-hidden="true" />
            {t("map.persons", { count: persons.length })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mic className="h-4 w-4" aria-hidden="true" />
            {t("map.testimonies", { count: testimonies.length })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {t("map.sources", { count: sources.length })}
          </span>
          {comparison && (
            <span className="inline-flex items-center gap-1.5 text-accent">
              <ChevronsLeftRight className="h-4 w-4" aria-hidden="true" />
              {t("place.beforeAfter")}
            </span>
          )}
        </div>

        <Link
          to={`/lieux/${place.code}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-accent"
        >
          {t("map.openPlace")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <PhotoViewer photos={toViewerPhotos(photos, lang, t)} index={viewerIndex} onIndexChange={setViewerIndex} />
    </div>
  );
};

const MapPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: places, loading, error } = useApi<PlaceSummary[]>("/places");
  const plan = usePlan();
  const planBounds: L.LatLngBoundsExpression = [
    [0, 0],
    [plan.height, plan.width],
  ];
  const coords = (place: PlaceSummary, view: Mode) => coordsOf(place, view, plan.height);

  const [mode, setMode] = useState<Mode>("plan");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tour, setTour] = useState<number | null>(null);

  const filtered = useMemo(
    () => (places ?? []).filter((place) => kind === "all" || kindOf(place) === kind),
    [places, kind]
  );
  const visible = filtered.filter((place) => coords(place, mode));
  const notPlaced = filtered.length - visible.length;
  const kinds = [...new Set((places ?? []).map(kindOf))];
  const numberOf = (code: string) => filtered.findIndex((place) => place.code === code) + 1;

  const selectedPlace = visible.find((place) => place.code === selected) ?? null;
  const target = selectedPlace ? coords(selectedPlace, mode) : null;

  const select = (code: string | null) => {
    setSelected(code);
    if (code === null) setTour(null);
  };

  const goToStep = (step: number) => {
    const place = visible[step];
    if (!place) return;
    setTour(step);
    setSelected(place.code);
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setTour(null);
    setSelected(null);
  };

  return (
    <Page>
      <PageHeader eyebrow={t("map.eyebrow")} title={t("map.title")} lead={t("map.help")} />

      <Container className="py-10">
        <PageState loading={loading} error={error} />

        {/* Barre d'outils : vue, filtres, visite guidée */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div role="group" aria-label={t("map.view")} className="inline-flex rounded-full border border-line bg-card p-1">
            {(
              [
                { value: "plan", label: t("map.modePlan"), icon: Layers },
                { value: "real", label: t("map.modeReal"), icon: Satellite },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => changeMode(value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  mode === value ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {kinds.length > 1 && (
            <div role="group" aria-label={t("map.filter")} className="flex flex-wrap gap-2">
              {(["all", ...kinds] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={kind === value}
                  onClick={() => {
                    setKind(value);
                    select(null);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    kind === value ? "border-accent bg-accent-soft text-accent" : "border-line bg-card text-ink-soft hover:text-ink"
                  )}
                >
                  {value === "all" ? t("map.allKinds") : t(`place.kinds.${value}`)}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={visible.length === 0}
            onClick={() => (tour === null ? goToStep(0) : select(null))}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-sm transition hover:brightness-110 disabled:opacity-50"
          >
            {tour === null ? <Footprints className="h-4 w-4" aria-hidden="true" /> : <Square className="h-4 w-4" aria-hidden="true" />}
            {tour === null ? t("map.tour") : t("map.stopTour")}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Carte */}
          <div className="relative h-[26rem] overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-sm sm:h-[36rem]">
            {mode === "plan" ? (!plan.loaded ? null : 
              <MapContainer
                key={`plan-${plan.url}`}
                crs={L.CRS.Simple}
                bounds={planBounds}
                maxBounds={planBounds}
                maxBoundsViscosity={0.8}
                minZoom={-1}
                maxZoom={2}
                zoomSnap={0.25}
                className="h-full w-full"
                attributionControl={false}
              >
                <ImageOverlay url={plan.url} bounds={planBounds} />
                <FlyTo target={target} />
                {visible.map((place) => (
                  <Marker
                    key={place._id}
                    position={coords(place, "plan")!}
                    icon={pinIcon(numberOf(place.code), place.code === selected, place.code === hovered)}
                    title={localize(place.name, lang)}
                    alt={localize(place.name, lang)}
                    eventHandlers={{
                      click: () => select(place.code),
                      mouseover: () => setHovered(place.code),
                      mouseout: () => setHovered(null),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -18]}>
                      {localize(place.name, lang)}
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <MapContainer key="real" center={FORT_CENTER} zoom={FORT_ZOOM} minZoom={14} maxZoom={19} className="h-full w-full">
                <TileLayer url={SATELLITE_TILES} attribution={SATELLITE_ATTRIBUTION} maxZoom={19} />
                <FlyTo target={target} zoom={18} />
                <Marker position={FORT_CENTER} icon={fortIcon(t("site.short"))} interactive={false} keyboard={false} />
                {visible.map((place) => (
                  <Marker
                    key={place._id}
                    position={coords(place, "real")!}
                    icon={pinIcon(numberOf(place.code), place.code === selected, place.code === hovered)}
                    title={localize(place.name, lang)}
                    alt={localize(place.name, lang)}
                    eventHandlers={{
                      click: () => select(place.code),
                      mouseover: () => setHovered(place.code),
                      mouseout: () => setHovered(null),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -18]}>
                      {localize(place.name, lang)}
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* Pastilles d'information */}
            <div className="pointer-events-none absolute top-3 right-3 z-[500] flex flex-col items-end gap-2">
              {mode === "plan" && plan.provisional && (
                <span className="rounded-full bg-night/80 px-3 py-1 text-xs text-on-night">{t("map.planNote")}</span>
              )}
              {notPlaced > 0 && (
                <span className="rounded-full bg-card/90 px-3 py-1 text-xs text-ink shadow">
                  {t(mode === "plan" ? "map.notPlacedPlan" : "map.notPlacedReal", { count: notPlaced })}
                </span>
              )}
            </div>

            {/* Barre de la visite guidée */}
            <AnimatePresence>
              {tour !== null && (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  className="absolute inset-x-3 bottom-3 z-[500] flex items-center gap-3 rounded-2xl bg-night/90 p-3 text-on-night shadow-xl backdrop-blur"
                  role="region"
                  aria-label={t("map.tour")}
                >
                  <button
                    type="button"
                    onClick={() => goToStep(tour - 1)}
                    disabled={tour === 0}
                    aria-label={t("timeline.previous")}
                    className="rounded-full p-2 hover:bg-on-night/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div className="min-w-0 flex-1 text-center" aria-live="polite">
                    <p className="text-xs text-on-night-soft">{t("map.tourStep", { n: tour + 1, total: visible.length })}</p>
                    <p className="truncate font-display text-lg">{selectedPlace ? localize(selectedPlace.name, lang) : ""}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(tour + 1)}
                    disabled={tour >= visible.length - 1}
                    aria-label={t("timeline.next")}
                    className="rounded-full p-2 hover:bg-on-night/10 disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Aperçu du lieu sélectionné, sinon la liste */}
          <div className="lg:max-h-[36rem]">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.aside
                  key={selected}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-3xl border border-line bg-card shadow-lg"
                  aria-label={t("map.preview")}
                >
                  <PlacePreview code={selected} onClose={() => select(null)} />
                </motion.aside>
              ) : (
                <motion.section
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  aria-labelledby="places-title"
                >
                  <h2 id="places-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                    {t("map.list")}
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">{t("map.selectHint")}</p>
                  <ul className="mt-4 space-y-3">
                    {filtered.map((place) => {
                      const Icon = KIND_ICONS[kindOf(place)];
                      const onMap = Boolean(coords(place, mode));
                      return (
                        <li key={place._id}>
                          <button
                            type="button"
                            onClick={() => select(place.code)}
                            onMouseEnter={() => setHovered(place.code)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(place.code)}
                            onBlur={() => setHovered(null)}
                            className={cn(
                              "group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition",
                              hovered === place.code ? "border-accent shadow-lg" : "border-line hover:border-ink/30"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold",
                                onMap ? "bg-accent text-accent-ink" : "border-2 border-dashed border-line text-ink-soft"
                              )}
                            >
                              {onMap ? numberOf(place.code) : <Icon className="h-4 w-4" aria-hidden="true" />}
                            </span>
                            <span className="flex-1">
                              <span className="block font-display text-lg text-ink">{localize(place.name, lang)}</span>
                              <span className="text-sm text-ink-soft">
                                {t(`place.kinds.${kindOf(place)}`)}
                                {!onMap && ` · ${t("map.notOnThisView")}`}
                              </span>
                            </span>
                            <ArrowRight className="h-4 w-4 text-ink-soft transition group-hover:translate-x-1" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Page>
  );
};

export default MapPage;
