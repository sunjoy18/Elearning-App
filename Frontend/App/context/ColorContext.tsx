import { createContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

type ColorContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue = {
  mode: 'light',
  setmode: (mode: any) => {},
};

export const ColorContext = createContext(defaultContextValue);

export const ColorContextProvider = ({ children }: ColorContextProviderProps) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    // Load the user's theme preference from SecureStore on component mount
    const loadThemePreference = async () => {
      try {
        const storedMode = await SecureStore.getItemAsync('themeMode');
        if (storedMode) {
          setMode(storedMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []); // Run this effect only once on component mount

  const setThemeMode = async (newMode: string) => {
    try {
      // Store the new theme preference in SecureStore
      await SecureStore.setItemAsync('themeMode', newMode);
      console.log("Updating ")
      setMode(newMode);
    } catch (error) {
      console.error('Error setting theme preference:', error);
    }
  };

  const contextValue = {
    mode,
    setmode: setThemeMode, // Use setThemeMode instead of setmode
  };

  return (
    <ColorContext.Provider value={contextValue}>{children}</ColorContext.Provider>
  );
};
