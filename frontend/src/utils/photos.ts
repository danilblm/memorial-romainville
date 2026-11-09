import { PlacePhoto } from "../types/Place";
import { localize } from "./localize";
import { mediaUrl } from "./mediaUrl";
import type { ViewerPhoto } from "../components/PhotoViewer";

type Translate = (key: string) => string;

// Photos d'un lieu, prêtes pour la visionneuse
export const toViewerPhotos = (photos: PlacePhoto[], lang: string, t: Translate): ViewerPhoto[] =>
  photos.map((photo) => ({
    url: mediaUrl(photo.url) ?? photo.url,
    caption: localize(photo.caption, lang),
    meta: [photo.era && photo.era !== "inconnue" ? t(`place.eras.${photo.era}`) : null, photo.dateLabel]
      .filter(Boolean)
      .join(" · "),
  }));

// Une photo d'archive et une photo actuelle : de quoi comparer « hier et aujourd'hui »
export const findComparison = (photos: PlacePhoto[]) => {
  const before = photos.find((photo) => photo.era === "ancienne");
  const after = photos.find((photo) => photo.era === "actuelle");
  return before && after ? { before, after } : null;
};
