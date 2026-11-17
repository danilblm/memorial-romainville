import { BASE_URL } from "../constants/baseUrl";

// Les médias téléversés sont servis par l'API : « /media/… » (équipe), « /community-media/… » (membres)
export const mediaUrl = (url?: string | null) => {
  if (!url) return undefined;
  return url.startsWith("/media/") || url.startsWith("/community-media/") ? `${BASE_URL}${url}` : url;
};
