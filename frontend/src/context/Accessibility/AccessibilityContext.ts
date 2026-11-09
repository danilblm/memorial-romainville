import { createContext, useContext } from "react";

export interface AccessibilitySettings {
  fontScale: number; // 1 = taille normale
  highContrast: boolean;
  dyslexicFont: boolean;
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontScale: 1,
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
