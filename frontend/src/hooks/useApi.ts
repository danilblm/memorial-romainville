import { useEffect, useState } from "react";
import { apiGet } from "../api/client";

// Charge une ressource de l'API ; passer null pour ne rien charger.
export function useApi<T>(path: string | null, token?: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setLoading(true);

    apiGet<T>(path, token)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err: Error & { status?: number }) => {
        if (!cancelled) setError(err.status ? String(err.status) : err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, token, reloadKey]);

  return { data, error, loading, reload: () => setReloadKey((key) => key + 1) };
}
