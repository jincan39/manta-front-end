import store from 'store';

const LAST_SEEN_PRIVATE_ADDRESS_STORAGE_KEY = 'lastSeenPrivateAddressHistory';

export const getLastSeenPrivateAddress = () => {
  return store.get(LAST_SEEN_PRIVATE_ADDRESS_STORAGE_KEY, null);
};

export const setLastSeenPrivateAddress = (privateAddress: string) => {
  store.set(LAST_SEEN_PRIVATE_ADDRESS_STORAGE_KEY, privateAddress);
};
