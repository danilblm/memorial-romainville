import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Traduction automatique des textes écrits par les membres (publications, commentaires).
// Le site est traduit par nos fichiers fr/en ; les textes des membres, eux, passent par
// le service gratuit de Google Traduction, seulement quand la langue du site n'est pas le français.
// Les résultats sont gardés en mémoire pour ne pas retraduire le même texte.

const cache = new Map<string, Promise<string | null>>();

const translateOne = (text: string, target: string): Promise<string | null> => {
  const key = `${target}:${text}`;
  const known = cache.get(key);
  if (known) return known;

  const request = fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text.slice(0, 4000))}`,
  )
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data: [Array<[string]>, unknown, string]) => {
      // data[2] = langue détectée : si le texte est déjà dans la bonne langue, rien à faire
      if (data[2] === target) return null;
      return data[0].map((part) => part[0]).join("");
    })
    .catch(() => {
      cache.delete(key); // on réessaiera plus tard
      return null;
    });

  cache.set(key, request);
  return request;
};

/**
 * Renvoie les textes traduits dans la langue du site (ou les originaux en français,
 * pendant le chargement, ou si la traduction échoue).
 */
export const useAutoTranslate = (texts: string[]) => {
  const { i18n } = useTranslation();
  const target = i18n.language.slice(0, 2);
  const active = target !== "fr";
  const [result, setResult] = useState<{ key: string; texts: (string | null)[] } | null>(null);
  const key = `${target}|${texts.join("\u0000")}`;

  useEffect(() => {
    if (!active) return;
    let alive = true;
    Promise.all(texts.map((text) => (text.trim() ? translateOne(text, target) : Promise.resolve(null)))).then((translated) => {
      if (alive) setResult({ key, texts: translated });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  const ready = active && result?.key === key;
  const translated = ready ? result.texts : [];
  return {
    texts: texts.map((text, index) => translated[index] ?? text),
    isTranslated: translated.some(Boolean),
    loading: active && !ready,
  };
};
