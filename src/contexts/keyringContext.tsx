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
  HAS_AUTH_TO_CONNECT_WALLET_KEY
} from 'utils/persistence/connectAuthorizationStorage';
import {
  LAST_WALLET_STORAGE_KEY,
} from 'utils/persistence/walletStorage';
import keyring from '@polkadot/ui-keyring';
import { getWallets } from '@talismn/connect-wallets';
import { useLocalStorage } from 'hooks';

const KeyringContext = createContext();
const MAX_WAIT_COUNT = 5;

export const KeyringContextProvider = (props) => {
  const [waitExtensionCounter, setWaitExtensionCounter] = useState(0);
  const [isKeyringInit, setIsKeyringInit] = useState(false);
  const [keyringAddresses, setKeyringAddresses] = useState([]);
  const [web3ExtensionInjected, setWeb3ExtensionInjected] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [hasAuthToConnectWallet, setHasAuthToConnectWalletStorage] = useLocalStorage(
    HAS_AUTH_TO_CONNECT_WALLET_KEY,
    []
  );
  const [lastAccessedWallet, setLastAccessedWallet] = useLocalStorage(
    LAST_WALLET_STORAGE_KEY,
    {}
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
  };

  const subscribeWalletAccounts = async (wallet, saveToStorage = true) => {
    let unsubscribe = () => {};
    if (wallet) {
      wallet.enable(APP_NAME).then(() => {
        keyringIsBusy.current = true;
        unsubscribe = wallet.subscribeAccounts(async (accounts) => {
          let currentKeyringAddresses = keyring
            .getAccounts()
            .map((account) => account.address);

          const updatedAccounts = await wallet.getAccounts();
          const updatedAddresses = updatedAccounts.map(
            (account) => account.address
          );

          currentKeyringAddresses.forEach((address) => {
            keyring.forgetAccount(address);
          });

          // keyring has the possibility to still contain accounts
          currentKeyringAddresses = keyring
            .getAccounts()
            .map((account) => account.address);

          if (currentKeyringAddresses.length === 0) {
            updatedAccounts.forEach((account) => {
              keyring.loadInjected(account.address, { ...account });
            });

            setSelectedWallet(wallet);
            saveToStorage && setLastAccessedWallet(wallet);
            setKeyringAddresses(updatedAddresses);
          }
          keyringIsBusy.current = false;
        });
      });
    }
    return unsubscribe;
  };

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
        subscribeWalletAccounts(selectedWallet, saveToStorage);
        return true;
      } catch (e) {
        const walletNames = removeWalletName(
          extensionName,
          hasAuthToConnectWallet
        );
        setHasAuthToConnectWalletStorage(walletNames);
        return false;
      }
    }
  };

  useEffect(() => {
    if (!isKeyringInit) {
      return;
    }

    const withoutLastAccessedWallet = removeWalletName(
      lastAccessedWallet.extensionName,
      hasAuthToConnectWallet
    );

    withoutLastAccessedWallet?.map((walletName) => {
      connectWallet(walletName, false);
    });

    setTimeout(() => {
      connectWallet(lastAccessedWallet.extensionName);
    }, 200);
  }, [isKeyringInit]);

  const value = {
    keyring: keyring, // keyring object would not change even if properties changed
    isKeyringInit: isKeyringInit,
    keyringAddresses: keyringAddresses, //keyring object would not change so use keyringAddresses to trigger re-render
    web3ExtensionInjected: web3ExtensionInjected,
    connectWalletExtension: connectWalletExtension,
    subscribeWalletAccounts: subscribeWalletAccounts,
    selectedWallet: selectedWallet,
    connectWallet: connectWallet,
    keyringIsBusy: keyringIsBusy
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
