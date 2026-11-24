// Description des fiches éditables dans l'administration.
// Pour ajouter un champ : l'ajouter au modèle Mongoose (backend) puis ici.

export type EntityName = "persons" | "places" | "events" | "sources" | "testimonies";

export type FieldType =
  | "text"
  | "number"
  | "localized"
  | "localizedMultiline"
  | "fuzzyDate"
  | "select"
  | "boolean"
  | "status"
  | "tags"
  | "ref"
  | "refs"
  | "claims"
  | "localizedList"
  | "publication"
  | "position"
  | "geo"
  | "photos"
  | "media";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  refEntity?: EntityName;
  accept?: string; // pour les médias
}

export type FormValues = Record<string, unknown>;

export interface EntityConfig {
  name: EntityName;
  singular: string;
  plural: string;
  description: string;
  fields: FieldConfig[];
  // Champs affichés d'emblée ; les autres sont rangés dans « Plus de détails »
  main: string[];
  defaults: () => FormValues;
}

const STATUS: FieldConfig = {
  key: "status",
  label: "Statut de validation",
  type: "status",
  help: "Seules les fiches « Validée » sont visibles par le public.",
};

const CLAIMS: FieldConfig = {
  key: "claims",
  label: "Affirmations",
  type: "claims",
  help: "Chaque information importante, avec ses sources et son niveau de fiabilité.",
};

const MISSING: FieldConfig = {
  key: "missingInfo",
  label: "Ce que l'on ne sait pas",
  type: "localizedList",
};

const PUBLICATION: FieldConfig = {
  key: "publication",
  label: "Consentement et visibilité",
  type: "publication",
};

const sourcesField = (label = "Sources"): FieldConfig => ({
  key: "sources",
  label,
  type: "refs",
  refEntity: "sources",
});

export const ADMIN_ENTITIES: Record<EntityName, EntityConfig> = {
  persons: {
    name: "persons",
    singular: "Femme",
    plural: "Femmes",
    description: "Les fiches des femmes passées par le fort (arbre de l'accueil).",
    fields: [
      { key: "displayName", label: "Nom affiché", type: "text", required: true },
      { key: "nameVariants", label: "Autres orthographes du nom", type: "tags", help: "Entrée pour ajouter." },
      { key: "photo", label: "Photo", type: "media", accept: "image/*" },
      { key: "roles", label: "Rôles (résistante, otage, déportée…)", type: "tags", help: "Entrée pour ajouter." },
      { key: "biography", label: "Biographie", type: "localizedMultiline" },
      { key: "birth", label: "Naissance", type: "fuzzyDate" },
      { key: "death", label: "Décès", type: "fuzzyDate" },
      { key: "arrivalAtFort", label: "Arrivée au fort", type: "fuzzyDate", help: "Place la femme dans l'arbre." },
      { key: "departureFromFort", label: "Départ du fort", type: "fuzzyDate" },
      { key: "places", label: "Lieux", type: "refs", refEntity: "places" },
      { key: "events", label: "Événements", type: "refs", refEntity: "events" },
      sourcesField(),
      CLAIMS,
      MISSING,
      PUBLICATION,
      STATUS,
    ],
    main: ["displayName", "photo", "roles", "biography", "arrivalAtFort", "status"],
    defaults: () => ({
      displayName: "",
      status: "propose",
      publication: { consent: "inconnu", visibility: "publique" },
    }),
  },

  places: {
    name: "places",
    singular: "Lieu",
    plural: "Lieux",
    description: "Les casemates et espaces du fort (carte interactive).",
    fields: [
      {
        key: "code",
        label: "Code",
        type: "text",
        required: true,
        help: "Identifiant unique utilisé dans l'adresse, ex. casemate-17 (minuscules, tirets).",
      },
      {
        key: "kind",
        label: "Type de lieu",
        type: "select",
        required: true,
        options: [
          { value: "casemate", label: "Casemate" },
          { value: "cour", label: "Cour" },
          { value: "batiment", label: "Bâtiment" },
          { value: "autre", label: "Autre" },
        ],
      },
      { key: "name", label: "Nom", type: "localized", required: true },
      { key: "description", label: "Description", type: "localizedMultiline" },
      { key: "currentState", label: "État actuel", type: "localizedMultiline" },
      {
        key: "tourOrder",
        label: "Ordre dans la visite guidée",
        type: "number",
        help: "1 = premier lieu de la visite. Laisser vide pour le mettre à la fin.",
      },
      { key: "position", label: "Position sur le plan", type: "position" },
      { key: "geo", label: "Position sur la vue satellite", type: "geo" },
      { key: "photos", label: "Photographies", type: "photos" },
      sourcesField(),
      CLAIMS,
      MISSING,
      STATUS,
    ],
    main: ["code", "kind", "name", "description", "photos", "status"],
    defaults: () => ({ code: "", kind: "casemate", name: { fr: "", en: "" }, status: "propose" }),
  },

  events: {
    name: "events",
    singular: "Événement",
    plural: "Événements",
    description: "Les dates de la frise chronologique.",
    fields: [
      { key: "title", label: "Titre", type: "localized", required: true },
      { key: "description", label: "Description", type: "localizedMultiline" },
      { key: "start", label: "Date", type: "fuzzyDate", required: true },
      { key: "end", label: "Date de fin (si période)", type: "fuzzyDate" },
      { key: "period", label: "Période", type: "text", help: "Sert au filtre de la frise, ex. 1940-1944." },
      { key: "persons", label: "Femmes concernées", type: "refs", refEntity: "persons" },
      { key: "places", label: "Lieux", type: "refs", refEntity: "places" },
      sourcesField(),
      CLAIMS,
      STATUS,
    ],
    main: ["title", "start", "description", "status"],
    defaults: () => ({ title: { fr: "", en: "" }, start: { precision: "jour" }, status: "propose" }),
  },

  sources: {
    name: "sources",
    singular: "Source",
    plural: "Sources",
    description: "Archives, lettres, photos, graffitis… sur lesquels reposent les fiches.",
    fields: [
      {
        key: "type",
        label: "Type de source",
        type: "select",
        required: true,
        options: [
          { value: "registre", label: "Registre" },
          { value: "lettre", label: "Lettre" },
          { value: "photographie", label: "Photographie" },
          { value: "graffiti", label: "Graffiti" },
          { value: "archive", label: "Archive" },
          { value: "article", label: "Article / ouvrage" },
          { value: "temoignage", label: "Témoignage" },
          { value: "autre", label: "Autre" },
        ],
      },
      { key: "title", label: "Titre", type: "localized", required: true },
      { key: "holder", label: "Lieu de conservation", type: "text", help: "Ex. Archives de la Seine-Saint-Denis." },
      { key: "reference", label: "Cote", type: "text" },
      { key: "author", label: "Auteur", type: "text" },
      { key: "date", label: "Date du document", type: "fuzzyDate" },
      { key: "url", label: "Lien en ligne", type: "text" },
      { key: "fileUrl", label: "Fichier (scan, photo)", type: "media", accept: "image/*,application/pdf" },
      { key: "rights", label: "Droits d'utilisation", type: "text", help: "Peut-on le montrer sur le site ?" },
      STATUS,
    ],
    main: ["type", "title", "fileUrl", "status"],
    defaults: () => ({ type: "archive", title: { fr: "", en: "" }, status: "propose" }),
  },

  testimonies: {
    name: "testimonies",
    singular: "Témoignage",
    plural: "Témoignages",
    description: "Récits écrits, audio ou vidéo, toujours avec leur contexte.",
    fields: [
      { key: "witnessName", label: "Qui parle ? (nom du témoin)", type: "text", required: true },
      {
        key: "witnessRelation",
        label: "Lien avec les faits",
        type: "text",
        required: true,
        help: "Internée, codétenue, enfant, historien…",
      },
      { key: "witness", label: "Fiche du témoin (si elle existe)", type: "ref", refEntity: "persons" },
      { key: "livedEvents", label: "Le témoin a vécu ce qu'il raconte", type: "boolean" },
      { key: "audience", label: "Pour qui ? (cadre du récit)", type: "localized", help: "Procès, enquête, interview, lettre…" },
      { key: "recordedAt", label: "Depuis quand ? (date du témoignage)", type: "fuzzyDate" },
      { key: "collectedBy", label: "Recueilli par", type: "text" },
      { key: "transformations", label: "Transformations", type: "text", help: "Transcrit, traduit, coupé…" },
      { key: "originalLocation", label: "Original conservé à", type: "text" },
      { key: "rights", label: "Droits d'utilisation", type: "text" },
      {
        key: "medium",
        label: "Support",
        type: "select",
        required: true,
        options: [
          { value: "ecrit", label: "Écrit" },
          { value: "audio", label: "Audio" },
          { value: "video", label: "Vidéo" },
        ],
      },
      { key: "mediaUrl", label: "Fichier audio ou vidéo", type: "media", accept: "audio/*,video/*" },
      { key: "transcript", label: "Texte / transcription", type: "localizedMultiline" },
      { key: "isExcerpt", label: "C'est un extrait", type: "boolean" },
      { key: "fullVersionUrl", label: "Lien vers la version complète", type: "text" },
      { key: "notCovered", label: "Ce que le témoignage ne dit pas", type: "localizedMultiline" },
      { key: "persons", label: "Femmes citées", type: "refs", refEntity: "persons" },
      { key: "events", label: "Événements", type: "refs", refEntity: "events" },
      { key: "places", label: "Lieux", type: "refs", refEntity: "places" },
      sourcesField(),
      PUBLICATION,
      STATUS,
    ],
    main: ["witnessName", "witnessRelation", "medium", "transcript", "mediaUrl", "status"],
    defaults: () => ({
      witnessName: "",
      witnessRelation: "",
      medium: "ecrit",
      livedEvents: false,
      isExcerpt: false,
      status: "propose",
      publication: { consent: "inconnu", visibility: "publique" },
    }),
  },
};

export const ENTITY_NAMES = Object.keys(ADMIN_ENTITIES) as EntityName[];

export const getEntityConfig = (name?: string) =>
  name && Object.prototype.hasOwnProperty.call(ADMIN_ENTITIES, name) ? ADMIN_ENTITIES[name as EntityName] : undefined;
