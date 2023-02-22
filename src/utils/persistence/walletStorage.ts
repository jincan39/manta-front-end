// @ts-nocheck
import {
  getFromLocalStorage,
  setLocalStorage
} from 'utils/persistence/storage';
export const LAST_WALLET_STORAGE_KEY = 'lastAccessedWallet';

export const getLastAccessedWallet = () => {
  return getFromLocalStorage(LAST_WALLET_STORAGE_KEY);
};

export const setLastAccessedWallet = (wallet) => {
  setLocalStorage(LAST_WALLET_STORAGE_KEY, wallet);
};
