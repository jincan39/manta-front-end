// @ts-nocheck
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import { getWallets } from '@talismn/connect-wallets';
import {
  LAST_ACCOUNT_STORAGE_KEY,
  getLastAccessedExternalAccount,
} from 'utils/persistence/externalAccountStorage';
import { useLocalStorage } from 'hooks';
import { useSubstrate } from './substrateContext';
import { useKeyring } from './keyringContext';

const ExternalAccountContext = createContext();

export const ExternalAccountContextProvider = (props) => {
  const { api } = useSubstrate();
  const { keyring, isKeyringInit, keyringAddresses } = useKeyring();
  const externalAccountRef = useRef(null);
  const [externalAccount, setExternalAccount] = useState(null);
  const [externalAccountSigner, setExternalAccountSigner] = useState(null);
  const [extensionSigner, setExtensionSigner] = useState(null);
  const [externalAccountOptions, setExternalAccountOptions] = useState([]);
  const [isInitialAccountSet, setIsInitialAccountSet] = useState(false);
  const [lastAccountAddress,setLastAccessedExternalAccountAddress] = useLocalStorage(LAST_ACCOUNT_STORAGE_KEY,'')

  const setApiSigner = (api) => {
    api?.setSigner(null);
    if (!externalAccount || !api) {
      return;
    }
    const {
      meta: { source, isInjected }
    } = externalAccount;
    const extensions = getWallets().filter((wallet) => wallet.extension);
    const extensionNames = extensions.map((ext) => ext.extensionName);
    if (isInjected && extensionNames.includes(source)) {
      const selectedWallet = getWallets().find(
        (wallet) => wallet.extensionName === source
      );
      setExtensionSigner(selectedWallet._signer);
      api.setSigner(selectedWallet._signer);
    }
    const signer = externalAccount.meta.isInjected
      ? externalAccount.address
      : externalAccount;
    setExternalAccountSigner(signer);
  };

  useEffect(() => {
    const setSignerOnChangeExternalAccount = async () => {
      setApiSigner(api);
    };
    setSignerOnChangeExternalAccount();
  }, [api, externalAccount]);

  const setStateWhenRemoveActiveExternalAccount = () => {
    if (keyringAddresses.length > 0) {
      // reset state if account(s) exist after disable selected external account
      const externalAccountOptions = keyring.getPairs();
      changeExternalAccountOptions(
        externalAccountOptions[0],
        externalAccountOptions
      );
    } else {
      // reset state if no account exist after disable selected external account
      changeExternalAccountOptions(null, []);
      setExternalAccountSigner(null);
      setExternalAccountOptions([]);
    }
  };

  useEffect(() => {
    const setInitialExternalAccount = async () => {
      if (
        !isInitialAccountSet &&
        isKeyringInit &&
        keyringAddresses.length > 0
      ) {
        const keyringExternalAccountOptions = keyring.getPairs();
        if (keyringExternalAccountOptions.length === 0) {
          return;
        }
        // The user's default account is either their last accessed polkadot.js account,
        // or, as a fallback, the first account in their polkadot.js wallet
        const initialAccount =
          getLastAccessedExternalAccount(lastAccountAddress, keyring) ||
          keyringExternalAccountOptions[0];
        changeExternalAccountOptions(
          initialAccount,
          keyringExternalAccountOptions
        );
        setIsInitialAccountSet(true);
      }
    };
    if (!isInitialAccountSet) {
      const interval = setInterval(async () => {
        setInitialExternalAccount();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isInitialAccountSet, isKeyringInit, keyringAddresses]);

  useEffect(() => {
    const handleKeyringAddressesChange = () => {
      if (!isInitialAccountSet) {
        return;
      }
      // ensure newly added account after removing all accounts can be updated
      if (!externalAccount) {
        const accounts = keyring.getPairs();
        changeExternalAccountOptions(accounts[0], accounts);
      } else if (!keyring.getAccount(externalAccount.address)) {
        setStateWhenRemoveActiveExternalAccount();
      } else {
        setExternalAccountOptions(
          orderExternalAccountOptions(externalAccount, keyring.getPairs() || [])
        );
      }
    };
    handleKeyringAddressesChange();
  }, [isInitialAccountSet, keyringAddresses]);

  // ensure externalAccount is the first item of externalAccountOptions
  const orderExternalAccountOptions = (
    selectedAccount,
    externalAccountOptions
  ) => {
    const orderedExternalAccountOptions = [];
    orderedExternalAccountOptions.push(selectedAccount);
    externalAccountOptions.forEach((account) => {
      if (account.address !== selectedAccount.address) {
        orderedExternalAccountOptions.push(account);
      }
    });
    return orderedExternalAccountOptions;
  };

  const changeExternalAccount = async (account) => {
    changeExternalAccountOptions(account, externalAccountOptions);
    setLastAccessedExternalAccountAddress(account?.address);
  };

  const changeExternalAccountOptions = async (account, newExternalAccounts) => {
    setExternalAccount(account);
    setExternalAccountOptions(
      orderExternalAccountOptions(account, newExternalAccounts)
    );
    externalAccountRef.current = account;
  };

  const value = {
    setApiSigner,
    extensionSigner,
    externalAccount,
    externalAccountRef,
    externalAccountSigner,
    externalAccountOptions: externalAccountOptions,
    changeExternalAccount
  };

  return (
    <ExternalAccountContext.Provider value={value}>
      {props.children}
    </ExternalAccountContext.Provider>
  );
};

ExternalAccountContextProvider.propTypes = {
  children: PropTypes.any
};

export const useExternalAccount = () => ({
  ...useContext(ExternalAccountContext)
});
