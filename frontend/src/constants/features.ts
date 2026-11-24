// Interrupteur : affiche ou cache les pages « Archives publiées » et « Communauté du fort ».
// Pour les cacher (par ex. avant une présentation), mettre VITE_SHOW_COMMUNITY=false dans frontend/.env
// puis relancer `npm run dev`. Par défaut, elles sont affichées.
export const SHOW_COMMUNITY = import.meta.env.VITE_SHOW_COMMUNITY !== "false";
