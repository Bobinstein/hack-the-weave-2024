import React, { createContext, useState } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    aoResults: [],
    isLoading: false,
  });

  // Function to set loading state
  const setLoading = (isLoading) => {
    setGlobalState((prevState) => ({
      ...prevState,
      isLoading,
    }));
  };

  return (
    <GlobalContext.Provider value={{ globalState, setGlobalState, setLoading }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
