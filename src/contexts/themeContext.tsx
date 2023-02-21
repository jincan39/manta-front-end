// @ts-nocheck
import { themeType } from 'constants/ThemeConstants';
import { localStorageKeys } from 'constants/LocalStorageConstants';
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getFromLocalStorage, setLocalStorage } from 'utils/persistence/storage';

const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedPrefs = getFromLocalStorage(
      localStorageKeys.CurrentTheme
    );
    if (typeof storedPrefs === 'string') {
      return storedPrefs;
    }
    const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (userMedia.matches) {
      return themeType.Dark;
    }
  }

  return themeType.Light;
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ initialTheme, children }) => {
  const [theme, setTheme] = useState(themeType.Dark);

  const rawSetTheme = (theme) => {
    const root = window.document.documentElement;
    const isDark = theme === themeType.Dark;

    root.classList.remove(isDark ? themeType.Light : themeType.Dark);
    root.classList.add(theme);

    setLocalStorage(localStorageKeys.CurrentTheme, theme);
  };

  if (initialTheme) {
    rawSetTheme(initialTheme);
  }

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  initialTheme: PropTypes.string,
  children: PropTypes.any
};
