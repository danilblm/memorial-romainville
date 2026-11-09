import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { AccessibilityContext, AccessibilitySettings, DEFAULT_SETTINGS } from "./AccessibilityContext";

const STORAGE_KEY = "a11y-settings";

const load = (): AccessibilitySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const AccessibilityProvider: FC<PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(load);

  // Les pages Tailwind lisent ces attributs (voir index.css)
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.contrast = settings.highContrast ? "high" : "normal";
    root.dataset.dyslexic = String(settings.dyslexicFont);
    root.style.setProperty("--font-scale", String(settings.fontScale));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // stockage indisponible : les réglages restent pour cette visite
    }
  }, [settings]);

  // Thème MUI des pages d'administration, accordé aux mêmes couleurs.
  // La taille du texte passe par la taille de <html> (unités rem) : pas de facteur ici.
  const theme = useMemo(
    () =>
      createTheme({
        palette: settings.highContrast
          ? {
              mode: "dark",
              background: { default: "#000000", paper: "#000000" },
              text: { primary: "#ffffff", secondary: "#ffffff" },
              primary: { main: "#ffe600" },
              secondary: { main: "#ffe600" },
              divider: "#ffffff",
            }
          : {
              mode: "light",
              background: { default: "#f4eee3", paper: "#fbf8f1" },
              primary: { main: "#1e1a15" },
              secondary: { main: "#9a3a22" },
              text: { primary: "#1e1a15", secondary: "#5d5447" },
              divider: "#d8cdb9",
            },
        typography: { fontFamily: "var(--body-font)" },
        shape: { borderRadius: 10 },
      }),
    [settings.highContrast]
  );

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        update: (patch) => setSettings((current) => ({ ...current, ...patch })),
        reset: () => setSettings(DEFAULT_SETTINGS),
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
