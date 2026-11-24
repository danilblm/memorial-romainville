import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { AccessibilityContext, AccessibilitySettings, DEFAULT_SETTINGS } from "./AccessibilityContext";

// v2 : nouvelle taille par défaut, les anciens réglages enregistrés (100 %) sont ignorés
const STORAGE_KEY = "a11y-settings-v2";

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
              background: { default: "#ffffff", paper: "#ffffff" },
              // Même rouge que le logo et les boutons du site
              primary: { main: "#9e2b1f" },
              secondary: { main: "#18181b" },
              text: { primary: "#18181b", secondary: "#52525b" },
              divider: "#e4e4e7",
            },
        typography: {
          fontFamily: "var(--body-font)",
          h1: { fontFamily: "var(--display-font, serif)" },
          h2: { fontFamily: "var(--display-font, serif)" },
          h3: { fontFamily: "var(--display-font, serif)" },
          h4: { fontFamily: "var(--display-font, serif)" },
          h5: { fontFamily: "var(--display-font, serif)" },
          button: { textTransform: "none", fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          // Boutons arrondis et sans ombre, comme sur le reste du site
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 999, paddingInline: 18 } },
          },
          MuiCard: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { borderRadius: 16 } } },
          MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
          MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
          MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
        },
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
