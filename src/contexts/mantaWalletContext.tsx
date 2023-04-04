import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

import { BN } from 'bn.js';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { getSubstrateWallets } from 'utils';
import {
  getLastAccessedExternalAccount,
  setLastAccessedExternalAccountAddress
} from 'utils/persistence/externalAccountStorage';

import AssetType from 'types/AssetType';
import { useKeyring } from './keyringContext';
import { useSubstrate } from './substrateContext';

type MantaWalletContext = {
  extensionSigner: any;
  externalAccount: KeyringPair | null;
  externalAccountOptions: KeyringPair[];
};

const MantaWalletContext = createContext<MantaWalletContext | null>(null);

export const MantaWalletContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const { api } = useSubstrate();
  const { keyring, isKeyringInit, keyringAddresses, selectedWallet } =
    useKeyring();
  const [externalAccount, setExternalAccount] = useState<KeyringPair | null>(
    null
  );
  const [extensionSigner, setExtensionSigner] = useState(null);
  const [externalAccountOptions, setExternalAccountOptions] = useState<
    KeyringPair[]
  >([]);
  const isInitialSync = useRef(false);
  const privateWallet = selectedWallet?.extension?.privateWallet;

  const setApiSigner = useCallback(
    (api: ApiPromise | null | undefined) => {
      if (!externalAccount || !api) {
        return;
      }
      const {
        meta: { source, isInjected }
      } = externalAccount;
      const substrateWallets = getSubstrateWallets();
      const walletWithExtensionList = substrateWallets.filter(
        (wallet) => wallet.extension
      );
      const extensionNames = walletWithExtensionList.map(
        (ext) => ext.extensionName
      );
      if (isInjected && extensionNames.includes(source as string)) {
        const selectedWallet = walletWithExtensionList.find(
          (wallet) => wallet.extensionName === source
        );
        // setPrivateWallet(selectedWallet?.extension?.privateWallet);

        setExtensionSigner(selectedWallet?.signer);
        api.setSigner(selectedWallet?.signer);
      }
    },
    [externalAccount]
  );

  useEffect(() => {
    const setSignerOnChangeExternalAccount = async () => {
      setApiSigner(api);
    };
    setSignerOnChangeExternalAccount();
  }, [api, externalAccount, setApiSigner]);

  // ensure externalAccount is the first item of externalAccountOptions
  const orderExternalAccountOptions = (
    selectedAccount: KeyringPair | null,
    externalAccountOptions: KeyringPair[]
  ) => {
    const orderedExternalAccountOptions = [];
    if (selectedAccount) {
      orderedExternalAccountOptions.push(selectedAccount);
    }
    externalAccountOptions.forEach((account: KeyringPair) => {
      if (account.address !== selectedAccount?.address) {
        orderedExternalAccountOptions.push(account);
      }
    });
    return orderedExternalAccountOptions;
  };

  const changeExternalAccountOptions = useCallback(
    async (account: KeyringPair | null, newExternalAccounts: KeyringPair[]) => {
      setExternalAccount(account);
      setExternalAccountOptions(
        orderExternalAccountOptions(account, newExternalAccounts)
      );
    },
    []
  );

  const setStateWhenRemoveActiveExternalAccount = useCallback(
    (account) => {
      if (keyringAddresses.length > 0) {
        // reset state if account(s) exist after disable selected external account
        const externalAccountOptions = keyring.getPairs() as KeyringPair[];
        changeExternalAccountOptions(
          account || externalAccountOptions[0],
          externalAccountOptions
        );
      } else {
        // reset state if no account exist after disable selected external account
        changeExternalAccountOptions(null, []);
        setExternalAccountOptions([]);
      }
    },
    [changeExternalAccountOptions, keyring, keyringAddresses.length]
  );

  const getSpendableBalance = useCallback(
    async (assetType: AssetType) => {
      if (!privateWallet?.getZkBalance) {
        return null;
      }

      // TODO
      const decimals = '12';
      const network = 'Calamari';
      let balanceRaw = '0';
      try {
        balanceRaw = await privateWallet.getZkBalance({
          network,
          assetId: assetType.assetId
        });
      } catch (error) {
        return new BN(balanceRaw);
      }
      const pow = new BN(decimals);
      const balance = new BN(balanceRaw).div(new BN(10).pow(pow));

      return balance;
    },
    [privateWallet]
  );

  useEffect(() => {
    const setInitialExternalAccount = async () => {
      if (
        !isInitialSync.current &&
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
          getLastAccessedExternalAccount(keyring, source as string) ||
          keyringExternalAccountOptions[0];
        changeExternalAccountOptions(
          initialAccount,
          keyringExternalAccountOptions
        );
        isInitialSync.current = true;
      }
    };
    if (!isInitialSync.current) {
      const interval = setInterval(async () => {
        setInitialExternalAccount();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [
    changeExternalAccountOptions,
    isInitialSync,
    isKeyringInit,
    keyring,
    keyringAddresses
  ]);

  useEffect(() => {
    const handleKeyringAddressesChange = () => {
      if (!isInitialSync.current) {
        return;
      }
      const accounts = keyring.getPairs() as KeyringPair[];
      const {
        meta: { source }
      } = accounts[0] || { meta: {} };
      const account: KeyringPair =
        getLastAccessedExternalAccount(keyring, source as string) ||
        accounts[0];

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
  }, [
    changeExternalAccountOptions,
    externalAccount,
    isInitialSync,
    keyring,
    keyringAddresses,
    setStateWhenRemoveActiveExternalAccount
  ]);

  const changeExternalAccount = useCallback(
    async (account: KeyringPair) => {
      changeExternalAccountOptions(account, externalAccountOptions);
      setLastAccessedExternalAccountAddress(account);
    },
    [changeExternalAccountOptions, externalAccountOptions]
  );

  const value = useMemo(
    () => ({
      isInitialSync,
      extensionSigner,
      externalAccount,
      externalAccountOptions,
      getSpendableBalance
    }),
    [
      isInitialSync,
      getSpendableBalance
    ]
  );

  return (
    <MantaWalletContext.Provider value={value}>
      {children}
    </MantaWalletContext.Provider>
  );
};

export const useMantaWallet = () => ({
  ...useContext(MantaWalletContext)
});
