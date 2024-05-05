import { createContext, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

type EnrollContextProviderProps = {
  children: React.ReactNode;
};

const defaultContextValue = {
  enroll: '',
  setEnroll: (enroll: any) => {},
};

export const EnrollContext = createContext(defaultContextValue);

export const EnrollContextProvider = ({ children }: EnrollContextProviderProps) => {
  const [enroll, setEnroll] = useState('');

  useEffect(() => {
    console.log("Enroll Context: ",enroll)
    const loadEnrollState = async () => {
      try {
        const newEnroll: any = await SecureStore.getItemAsync('newEnroll');
        if (newEnroll){
          setEnroll(newEnroll);
        }
      } catch (error) {
        console.error('Error setting enroll state:', error);
      }
    };

    loadEnrollState();
  }, [])

  const setEnrollState = async (newEnroll: string) => {
    try {
      await SecureStore.setItemAsync('newEnroll', newEnroll);
      console.log("enrollContext: Earlier - ",newEnroll)
      setEnroll(newEnroll);
      console.log('enrollContext: Now - ',enroll)
    } catch (error) {
      console.error('Error setting enroll state:', error);
    }
  };

  const contextValue = {
    enroll,
    setEnroll: setEnrollState,
  };

  return (
    <EnrollContext.Provider value={contextValue}>{children}</EnrollContext.Provider>
  );
};
