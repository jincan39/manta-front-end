// @ts-nocheck
import {
  getFromLocalStorage,
  setLocalStorage
} from 'utils/persistence/storage';

const LAST_ACCOUNT_STORAGE_KEY = 'lastAccessedExternalAccountAddress';

export const getLastAccessedExternalAccount = (keyring, walletType) => {
  const STORAGE_KEY = `${LAST_ACCOUNT_STORAGE_KEY}`;
  const lastStore = getFromLocalStorage(STORAGE_KEY) || {};
  const lastAccountAddress = lastStore[walletType];
  if (!lastAccountAddress) {
    return null;
  }
  // Validate that account is still in user's keychain
  try {
    return keyring.getPair(lastAccountAddress);
  } catch (error) {
    return null;
  }
};

export const setLastAccessedExternalAccountAddress = (lastAccount) => {
  const STORAGE_KEY = `${LAST_ACCOUNT_STORAGE_KEY}`;
  const {
    meta: { source: key },
    address
  } = lastAccount;
  const lastStore = getFromLocalStorage(STORAGE_KEY);
  setLocalStorage(STORAGE_KEY, { ...lastStore, [key]: address });
};
