export interface ThemeColors {
  background: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string; // Gold color
  primaryHover: string;
  secondary: string; // Orange color
  accent: string; // Red color
  success: string;
  warning: string;
  error: string;
  white: string;
  black: string;
}

export const DarkThemeColors: ThemeColors = {
  background: "#09090b", // zinc-950
  card: "#18181b", // zinc-900
  border: "#27272a", // zinc-800
  text: "#ffffff",
  textMuted: "#a1a1aa", // zinc-400
  primary: "#eab308", // yellow-500 / Gold
  primaryHover: "#ca8a04", // yellow-600
  secondary: "#f97316", // orange-500
  accent: "#ef4444", // red-500
  success: "#22c55e",
  warning: "#facc15",
  error: "#ef4444",
  white: "#ffffff",
  black: "#000000",
};

export const LightThemeColors: ThemeColors = {
  background: "#f4f4f5", // zinc-100
  card: "#ffffff",
  border: "#e4e4e7", // zinc-200
  text: "#09090b", // zinc-950
  textMuted: "#71717a", // zinc-500
  primary: "#ca8a04", // yellow-600
  primaryHover: "#a16207", // yellow-700
  secondary: "#ea580c", // orange-600
  accent: "#dc2626", // red-600
  success: "#16a34a",
  warning: "#ca8a04",
  error: "#dc2626",
  white: "#ffffff",
  black: "#000000",
};

export type ThemeMode = "dark" | "light";

export const getThemeColors = (mode: ThemeMode): ThemeColors => {
  return mode === "dark" ? DarkThemeColors : LightThemeColors;
};
