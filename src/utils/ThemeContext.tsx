import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeColors, ThemeMode, getThemeColors } from "./theme";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setThemeMode as setReduxTheme } from "../store/slices/userDetailsSlice";

interface ThemeContextProps {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const reduxTheme = useAppSelector((state) => state.userDetails.themeMode);
  const [theme, setThemeState] = useState<ThemeMode>(reduxTheme);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme_mode");
        if (savedTheme === "dark" || savedTheme === "light") {
          setThemeState(savedTheme);
          dispatch(setReduxTheme(savedTheme));
        } else if (systemScheme) {
          setThemeState(systemScheme as ThemeMode);
          dispatch(setReduxTheme(systemScheme as ThemeMode));
        }
      } catch (err) {
        console.warn("Error loading saved theme:", err);
      }
    };
    loadSavedTheme();
  }, [systemScheme]);

  const setTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem("theme_mode", mode);
      setThemeState(mode);
      dispatch(setReduxTheme(mode));
    } catch (err) {
      console.warn("Error saving theme choice:", err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const colors = getThemeColors(theme);

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
