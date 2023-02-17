// @ts-nocheck
import store from 'store';

const LAST_ACCOUNT_STORAGE_KEY = 'lastAccessedExternalAccountAddress';

export const getLastAccessedExternalAccount = ( keyring, walletType) => {
  const STORAGE_KEY = `${LAST_ACCOUNT_STORAGE_KEY}`;
  const lastStore = store.get(STORAGE_KEY) || {};
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
  const lastStore = store.get(STORAGE_KEY);
  store.set(STORAGE_KEY, { ...lastStore, [key]: address });
};
