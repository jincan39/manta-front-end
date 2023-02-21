export const LAST_ACCOUNT_STORAGE_KEY = 'lastAccessedExternalAccountAddress';

export const getLastAccessedExternalAccount = (
  lastAccountAddress: string,
  keyring: any
) => {
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
