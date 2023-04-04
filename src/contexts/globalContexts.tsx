// @ts-nocheck
import { localStorageKeys } from 'constants/LocalStorageConstants';
import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import store from 'store';
import { KeyringContextProvider } from './keyringContext';
import { ThemeProvider } from './themeContext';

const GlobalContext = createContext();

const GlobalContextProvider = ({children}) => {
  const [usingMantaWallet, _setUsingMantaWallet] = useState(store.get(localStorageKeys.UsingMantaWallet) || true);

  const setUsingMantaWallet = useCallback((state) => {
    _setUsingMantaWallet(state);
    store.set(localStorageKeys.UsingMantaWallet, state);
  }, []);

  const contextValue = useMemo(() => ({
    usingMantaWallet,
    setUsingMantaWallet
  }), [usingMantaWallet, setUsingMantaWallet]);

  return (
    <GlobalContext.Provider value={contextValue}>
      <KeyringContextProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider >
      </KeyringContextProvider>
    </GlobalContext.Provider>
  );
};

GlobalContextProvider.propTypes = {
  children: PropTypes.any
};

export const useGlobal = () => ({
  ...useContext(GlobalContext),
});

export default GlobalContextProvider;

