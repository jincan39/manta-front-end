import {
  getFromLocalStorage,
  setLocalStorage
} from 'utils/persistence/storage';

const LAST_SEEN_PRIVATE_ADDRESS_STORAGE_KEY = 'lastSeenPrivateAddressHistory';

export const getLastSeenPrivateAddress = () => {
  return getFromLocalStorage(LAST_SEEN_PRIVATE_ADDRESS_STORAGE_KEY);
};

export const setLastSeenPrivateAddress = (privateAddress: string) => {
  setLocalStorage(LAST_SEEN_PRIVATE_ADDRESS_STORAGE_KEY, privateAddress);
};
