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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // stockage indisponible : les réglages restent pour cette visite
    }
  }, [settings]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: settings.highContrast
          ? {
              mode: "dark",
              background: { default: "#000000", paper: "#000000" },
              text: { primary: "#ffffff", secondary: "#ffffff" },
              primary: { main: "#ffe600" },
              divider: "#ffffff",
            }
          : {
              mode: "light",
              background: { default: "#f7f5f0", paper: "#ffffff" },
              primary: { main: "#3d3a33" },
              secondary: { main: "#8a5a44" },
            },
        typography: {
          fontSize: 14 * settings.fontScale,
          fontFamily: settings.dyslexicFont
            ? '"OpenDyslexic", Arial, sans-serif'
            : '"Source Serif 4", Georgia, "Times New Roman", serif',
        },
      }),
    [settings]
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
