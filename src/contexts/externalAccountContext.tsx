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
  getLastAccessedExternalAccount,
  setLastAccessedExternalAccountAddress
} from 'utils/persistence/externalAccountStorage';
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

  const setStateWhenRemoveActiveExternalAccount = (account) => {
    if (keyringAddresses.length > 0) {
      // reset state if account(s) exist after disable selected external account
      const externalAccountOptions = keyring.getPairs();
      changeExternalAccountOptions(
        account||externalAccountOptions[0],
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
        const {
          meta: { source }
        } = keyringExternalAccountOptions[0] || { meta: {} };
        if (keyringExternalAccountOptions.length === 0) {
          return;
        }
        // The user's default account is either their last accessed polkadot.js account,
        // or, as a fallback, the first account in their polkadot.js wallet
        const initialAccount =
          getLastAccessedExternalAccount(keyring, source) ||
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
      const accounts = keyring.getPairs();
      const {
        meta: { source }
      } = accounts[0] || { meta: {} };
      const account =
        getLastAccessedExternalAccount(keyring, source) || accounts[0];
      if (!externalAccount) {
        changeExternalAccountOptions(account, accounts);
      } else if (!keyring.getAccount(externalAccount.address)) {
        setStateWhenRemoveActiveExternalAccount(account);
      } else {
        setExternalAccountOptions(
          orderExternalAccountOptions(account, keyring.getPairs() || [])
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
    setLastAccessedExternalAccountAddress(account);
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
    changeExternalAccount,
    changeExternalAccountOptions
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
