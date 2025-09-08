import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "@/constants/theme";
import { DARK_COLORS } from "@/constants/theme";

type ThemeState = {
  isDarkMode: boolean;
  theme: typeof COLORS;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      theme: COLORS,
      toggleTheme: () => {
        const current = get().isDarkMode;
        set({
          isDarkMode: !current,
          theme: !current ? DARK_COLORS : COLORS,
        });
      },
    }),
    {
      name: "theme-storage", // key trong AsyncStorage
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
