import { createContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

type ChapterCompleteContextProviderProps = {
  children: React.ReactNode;
};

const defaultChapterCompleteContextValue = {
  chapterComplete: '',
  setChapterComplete: (chapterComplete: any) => {},
};

export const ChapterCompleteContext = createContext(defaultChapterCompleteContextValue);

export const ChapterCompleteContextProvider = ({ children }: ChapterCompleteContextProviderProps) => {
  const [chapterComplete, setChapterComplete] = useState('');

  useEffect(() => {
    console.log("Chapter Complete Context: ", chapterComplete);
    const loadChapterCompleteState = async () => {
      try {
        const newChapterComplete: any = await SecureStore.getItemAsync('newChapterComplete');
        if (newChapterComplete) {
          setChapterComplete(newChapterComplete);
        }
      } catch (error) {
        console.error('Error setting chapter complete state:', error);
      }
    };

    loadChapterCompleteState();
  }, []);

  const setChapterCompleteState = async (newChapterComplete: string) => {
    try {
      await SecureStore.setItemAsync('newChapterComplete', newChapterComplete);
      console.log("chapterCompleteContext: Earlier - ", newChapterComplete);
      setChapterComplete(newChapterComplete);
      console.log('chapterCompleteContext: Now - ', chapterComplete);
    } catch (error) {
      console.error('Error setting chapter complete state:', error);
    }
  };

  const contextValue = {
    chapterComplete,
    setChapterComplete: setChapterCompleteState,
  };

  return (
    <ChapterCompleteContext.Provider value={contextValue}>{children}</ChapterCompleteContext.Provider>
  );
};
