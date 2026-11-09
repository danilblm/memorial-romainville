import { BASE_URL } from "../constants/baseUrl";

// Les médias téléversés par l'équipe sont servis par l'API ("/media/…")
export const mediaUrl = (url?: string | null) => {
  if (!url) return undefined;
  return url.startsWith("/media/") ? `${BASE_URL}${url}` : url;
};
