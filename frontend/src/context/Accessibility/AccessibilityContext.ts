import { createContext, useContext } from "react";

export interface AccessibilitySettings {
  fontScale: number; // 1 = taille normale
  highContrast: boolean;
  dyslexicFont: boolean;
}

// Taille par défaut selon l'écran : 160 % sur grand écran (1700 px et plus, ex. 1920 px),
// 120 % sur un portable, 100 % sur tablette et téléphone. Chaque visiteur peut la changer
// dans les réglages d'affichage.
const defaultFontScale = () => {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1700) return 1.6;
  if (window.innerWidth >= 1280) return 1.2;
  return 1;
};

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontScale: defaultFontScale(),
  highContrast: false,
  dyslexicFont: false,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  update: (patch: Partial<AccessibilitySettings>) => void;
  reset: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
  reset: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);
