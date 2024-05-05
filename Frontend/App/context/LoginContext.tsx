// import { createContext, useEffect, useState } from "react";
// import * as SecureStore from "expo-secure-store";

// type LoginContextProviderProps = {
//   children: React.ReactNode
// }
// let tkn: any;
// const fetchJwtToken = async () => {
//   try {
//     const token = await SecureStore.getItemAsync("jwtToken");
//     tkn = token;
//   } catch (error) {
//     console.error("Error retrieving jwtToken:", error);
//   }
//   console.log('connn tkn: ', tkn)
// };
// fetchJwtToken();
// const defaultContextValue = {
//   isLoggedIn: false,
//   setIsLoggedIn: (isLoggedIn: boolean) => { },
//   jwtToken: null
// };

// export const LoginContext = createContext(defaultContextValue);

// export const LoginContextProvider = ({ children }: LoginContextProviderProps) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const checkLogin = async () => {
//     try {
//       let tkn = await SecureStore.getItemAsync("jwtToken");
//       console.log("Context value: ", isLoggedIn);
//       if (tkn) {
//         setIsLoggedIn(true);
//       } else {
//         setIsLoggedIn(false);
//       }
//       console.log("Token: ", tkn);
//     } catch (error) {
//       console.error("Error in checkLogin:", error);
//     }
//   };

//   useEffect(() => {
//     checkLogin();
//   }, []);

//   useEffect(() => {
//     console.log("Context values: ", isLoggedIn);
//   }, [isLoggedIn]);


//   // try
//   const [jwtToken, setJwtToken] = useState<any>(null);
//   useEffect(() => {
//     const fetchJwtToken = async () => {
//       try {
//         const token = await SecureStore.getItemAsync("jwtToken");
//         setJwtToken(token);
//       } catch (error) {
//         console.error("Error retrieving jwtToken:", error);
//       }
//     };

//     fetchJwtToken();
//   }, [isLoggedIn]);

//   // Provide the actual context value with the state and updater function
//   const contextValue = {
//     isLoggedIn,
//     setIsLoggedIn,
//     jwtToken
//   };

//   return <LoginContext.Provider value={contextValue}>{children}</LoginContext.Provider>
// }


// LoginContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';

interface LoginState {
  isLoggedIn: boolean;
}

interface LoginAction {
  type: string;
}

const initialState: LoginState = {
  isLoggedIn: false,
};

const loginReducer = (state: LoginState, action: LoginAction): LoginState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false };
    default:
      // Handle unknown action types
      return state;
  }
};


interface LoginContextProps {
  children: ReactNode;
}

const LoginContext = createContext<{
  state: LoginState;
  dispatch: React.Dispatch<LoginAction>;
} | undefined>(undefined);

const LoginContextProvider = ({ children }: LoginContextProps) => {
  const [state, dispatch] = useReducer(loginReducer, initialState);

  return (
    <LoginContext.Provider value={{ state, dispatch }}>
      {children}
    </LoginContext.Provider>
  );
};

const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within a LoginContextProvider');
  }
  return context;
};

export { LoginContextProvider, useLogin };

