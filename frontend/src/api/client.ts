import { BASE_URL } from "../constants/baseUrl";

export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;

  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const authHeader = (token?: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

// Lit le message d'erreur renvoyé par l'API ({ message, errors } ou texte)
const toApiError = async (response: Response) => {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as { message?: string; errors?: Record<string, string> };
    return new ApiError(response.status, body.message ?? String(response.status), body.errors);
  } catch {
    return new ApiError(response.status, text || String(response.status));
  }
};

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { headers: authHeader(token) });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
  token?: string | null
): Promise<T> {
  const isForm = body instanceof FormData;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: isForm ? authHeader(token) : { "Content-Type": "application/json", ...authHeader(token) },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

// Téléverse un média (photo, audio, vidéo) pour une fiche
export const uploadMedia = (file: File, token: string | null) => {
  const data = new FormData();
  data.append("file", file);
  return apiSend<{ url: string }>("/admin/media", "POST", data, token);
};
