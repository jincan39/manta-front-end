// @ts-nocheck
import APP_NAME from 'constants/AppConstants';
import { SS58 } from 'constants/NetworkConstants';
import PropTypes from 'prop-types';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef
} from 'react';
import {
  setHasAuthToConnectWalletStorage,
  getHasAuthToConnectWalletStorage
} from 'utils/persistence/connectAuthorizationStorage';
import {
  getLastAccessedWallet,
  setLastAccessedWallet
} from 'utils/persistence/walletStorage';
import keyring from '@polkadot/ui-keyring';
import { getWallets } from '@talismn/connect-wallets';

const KeyringContext = createContext();
const MAX_WAIT_COUNT = 5;

export const KeyringContextProvider = (props) => {
  const [waitExtensionCounter, setWaitExtensionCounter] = useState(0);
  const [isKeyringInit, setIsKeyringInit] = useState(false);
  const [keyringAddresses, setKeyringAddresses] = useState([]);
  const [web3ExtensionInjected, setWeb3ExtensionInjected] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [hasAuthToConnectWallet, setHasAuthToConnectWallet] = useState(
    getHasAuthToConnectWalletStorage()
  );
  const keyringIsBusy = useRef(false);

  const addWalletName = (walletName, walletNameList) => {
    const copyWalletNameList = [...walletNameList];
    if (!copyWalletNameList.includes(walletName)) {
      copyWalletNameList.push(walletName);
      return copyWalletNameList;
    }
  };

  const removeWalletName = (walletName, walletNameList) => {
    return walletNameList.filter((name) => name !== walletName);
  };

  const connectWalletExtension = (extensionName) => {
    const walletNames = addWalletName(extensionName, hasAuthToConnectWallet);
    setHasAuthToConnectWalletStorage(walletNames);
    setHasAuthToConnectWallet(walletNames);
  };

  const refreshWalletAccounts = async (wallet) => {
    await wallet.enable(APP_NAME);
    keyringIsBusy.current = true;
    let currentKeyringAddresses = keyring.getAccounts().map((account) => account.address);

    const originUpdatedAccounts = await wallet.getAccounts();
    const updatedAccounts = originUpdatedAccounts.filter((a) =>
      ['ecdsa', 'ed25519', 'sr25519'].includes(a.type)
    ); // ethereum account address should be avoid in substrate (tailsman)
    const updatedAddresses = updatedAccounts.map((account) => account.address);
    currentKeyringAddresses.forEach((address) => {
      keyring.forgetAccount(address);
    });
    // keyring has the possibility to still contain accounts
    currentKeyringAddresses = keyring
      .getAccounts()
      .map((account) => account.address);

    if (currentKeyringAddresses.length === 0) {
      updatedAccounts.forEach((account) => {
        keyring.loadInjected(account.address, { ...account }, account.type);
      });

      setSelectedWallet(wallet);
      setKeyringAddresses(updatedAddresses);
    }
    keyringIsBusy.current = false;
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      selectedWallet && refreshWalletAccounts(selectedWallet);
    }, 1000);
    return () => interval && clearInterval(interval);
  }, [selectedWallet]);

  const triggerInitKeyringWhenWeb3ExtensionsInjected = async () => {
    if (!isKeyringInit) {
      if (
        window.injectedWeb3 &&
        Object.getOwnPropertyNames(window.injectedWeb3).length !== 0
      ) {
        setWeb3ExtensionInjected(
          Object.getOwnPropertyNames(window.injectedWeb3)
        );
        setTimeout(async () => {
          await initKeyring();
          if (waitExtensionCounter < MAX_WAIT_COUNT) {
            setWaitExtensionCounter((counter) => counter + 1);
          }
        }, 500);
      } else {
        setTimeout(async () => {
          if (waitExtensionCounter < MAX_WAIT_COUNT) {
            setWaitExtensionCounter((counter) => counter + 1);
          }
        }, 500);
      }
    }
  };

  const initKeyring = async () => {
    const unsubscribe = () => {};
    if (
      hasAuthToConnectWallet?.length > 0 &&
      !isKeyringInit &&
      web3ExtensionInjected.length !== 0
    ) {
      const isCalamari = window?.location?.pathname?.includes('calamari');
      keyring.loadAll(
        {
          ss58Format: isCalamari ? SS58.CALAMARI : SS58.DOLPHIN
        },
        []
      );
      setIsKeyringInit(true);
    }
    return unsubscribe;
  };

  useEffect(() => {
    return initKeyring();
  }, [hasAuthToConnectWallet]);

  useEffect(() => {
    triggerInitKeyringWhenWeb3ExtensionsInjected();
  }, [waitExtensionCounter]);

  const connectWallet = async (extensionName, saveToStorage = true) => {
    if (!isKeyringInit) {
      return;
    }
    const substrateWallets = getWallets();
    const selectedWallet = substrateWallets.find(
      (wallet) => wallet.extensionName === extensionName
    );
    if (!selectedWallet?.extension) {
      try {
        await selectedWallet.enable(APP_NAME);
        await refreshWalletAccounts(selectedWallet);
        saveToStorage && setLastAccessedWallet(selectedWallet);
        return true;
      } catch (e) {
        const walletNames = removeWalletName(
          extensionName,
          hasAuthToConnectWallet
        );
        setHasAuthToConnectWalletStorage(walletNames);
        setHasAuthToConnectWallet(walletNames);
        return false;
      }
    }
  };

  useEffect(() => {
    if (!isKeyringInit) {
      return;
    }
    const withoutLastAccessedWallet = removeWalletName(
      getLastAccessedWallet()?.extensionName,
      hasAuthToConnectWallet
    );

    withoutLastAccessedWallet?.map((walletName) => {
      connectWallet(walletName, false);
    });

    setTimeout(() => {
      connectWallet(getLastAccessedWallet()?.extensionName);
    }, 200);
  }, [isKeyringInit]);

  const value = {
    keyring, // keyring object would not change even if properties changed
    isKeyringInit,
    keyringAddresses, //keyring object would not change so use keyringAddresses to trigger re-render
    web3ExtensionInjected,
    selectedWallet,
    keyringIsBusy,
    connectWallet,
    connectWalletExtension,
    refreshWalletAccounts
  };

  return (
    <KeyringContext.Provider value={value}>
      {props.children}
    </KeyringContext.Provider>
  );
};

KeyringContextProvider.propTypes = {
  children: PropTypes.any
};

export const useKeyring = () => ({ ...useContext(KeyringContext) });
