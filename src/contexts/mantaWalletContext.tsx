// @ts-nocheck
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
import { BN } from 'bn.js';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import TxStatus from 'types/TxStatus';
import { removePendingTxHistoryEvent } from 'utils/persistence/privateTransactionHistory';
import { useConfig } from './configContext';
import { usePublicAccount } from './externalAccountContext';
import { useKeyring } from './keyringContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';

const MantaWalletContext = createContext<null>(null);

export const MantaWalletContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  // external contexts
  const { NETWORK_NAME: network } = useConfig();
  const { api } = useSubstrate();
  const { externalAccount } = usePublicAccount();
  const publicAddress = externalAccount?.address;
  const { setTxStatus } = useTxStatus();
  const { selectedWallet } = useKeyring();

  // private wallet
  const [privateWallet, setPrivateWallet] = useState(null);
  const [privateAddress, setPrivateAddress] = useState(null);
  const [privateWalletIsInitialized, setPrivateWalletIsInitialized] =
    useState(null);
  const [privateWalletIsAuthorized, setPrivateWalletIsAuthorized] =
    useState(null);
  const [privateWalletIsReady, setPrivateWalletIsReady] = useState(null);
  const [privateWalletIsBusy, setPrivateWalletIsBusy] = useState(null);
  const isInitialSync = useRef(false);

  // transaction state
  const txQueue = useRef([]);
  const finalTxResHandler = useRef(null);
  // todo: not sure if stale state is necessary to track here
  const [balancesAreStale, _setBalancesAreStale] = useState(false);
  const balancesAreStaleRef = useRef(false);

  const setBalancesAreStale = (areBalancesStale) => {
    balancesAreStaleRef.current = areBalancesStale;
    _setBalancesAreStale(areBalancesStale);
  };

  useEffect(() => {
    const getZkAddress = async () => {
      if (!selectedWallet || !privateWallet) {
        return;
      }
      const accounts = await selectedWallet?.getAccounts();
      if (!accounts || accounts.length <= 0) {
        return;
      }
      const { zkAddress } = accounts[0];
      setPrivateAddress(zkAddress);
    };
    getZkAddress();
  }, [privateWallet, selectedWallet]);

  useEffect(() => {
    if (selectedWallet?.extension?.privateWallet) {
      setPrivateWallet(selectedWallet.extension.privateWallet);
    }
  }, [selectedWallet]);

  // todo: refresh this on a loop or subscribe or something
  const getSpendableBalance = useCallback(
    async (assetType: AssetType) => {
      if (!privateWallet?.getZkBalance) {
        return null;
      }
      try {
        const balanceRaw = await privateWallet.getZkBalance({
          network,
          assetId: assetType.assetId
        });
        const res = new Balance(assetType, new BN(balanceRaw));
        console.log('res', res);
        return res;
      } catch (error) {
        console.error('error getting zkBalance', error);
        return null;
      }
    },
    [privateWallet]
  );

  // todo: deduplicate logic shared between this and the signer wallet context
  const handleInternalTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed());
          txQueue.current = [];
          console.error('Internal transaction failed', event);
        }
      }
    } else if (status.isFinalized) {
      console.log('Internal transaction finalized');
      await publishNextBatch();
    }
  };

  // todo: deduplicate logic shared between this and the signer wallet context
  const publishNextBatch = async () => {
    const sendExternal = async () => {
      try {
        const lastTx = txQueue.current.shift();
        await lastTx.signAndSend(publicAddress, finalTxResHandler.current);
        setTxStatus(TxStatus.processing(null, lastTx.hash.toString()));
      } catch (e) {
        console.error('Error publishing private transaction batch', e);
        setTxStatus(TxStatus.failed('Transaction declined'));
        removePendingTxHistoryEvent();
        txQueue.current = [];
      }
    };

    // todo: deduplicate logic shared between this and the signer wallet context
    const sendInternal = async () => {
      try {
        const internalTx = txQueue.current.shift();
        await internalTx.signAndSend(publicAddress, handleInternalTxRes);
      } catch (e) {
        setTxStatus(TxStatus.failed());
        txQueue.current = [];
      }
    };

    // TODO txQueue shouldn't be undefined
    if (txQueue?.current?.length === 0) {
      return;
    } else if (txQueue?.current?.length === 1) {
      sendExternal();
    } else {
      sendInternal();
    }
  };

  // todo: deduplicate logic shared between this and the signer wallet context
  const publishBatchesSequentially = async (batches, txResHandler) => {
    txQueue.current = batches;
    finalTxResHandler.current = txResHandler;
    try {
      publishNextBatch();
      return true;
    } catch (e) {
      console.error('Sequential baching failed', e);
      return false;
    }
  };

  const toPublic = async (balance, txResHandler) => {
    const signResult = await privateWallet.toPublicBuild({
      assetId: balance.assetType.assetId,
      amount: balance.valueAtomicUnits.toString(),
      polkadotAddress: publicAddress,
      network
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = [];
    for (let index = 0; index < signResult.length; index++) {
      const sign = signResult[index];
      const tx = api.tx(sign);
      batches.push(tx);
    }
    await publishBatchesSequentially(batches, txResHandler);
  };

  const privateTransfer = async (balance, receiveZkAddress, txResHandler) => {
    const signResult = await privateWallet.privateTransferBuild({
      assetId: balance.assetType.assetId,
      amount: balance.valueAtomicUnits.toString(),
      polkadotAddress: publicAddress,
      toZkAddress: receiveZkAddress,
      network
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = [];
    for (let index = 0; index < signResult.length; index++) {
      const sign = signResult[index];
      const tx = api.tx(sign);
      batches.push(tx);
    }
    await publishBatchesSequentially(batches, txResHandler);
  };

  const toPrivate = async (balance: Balance, txResHandler) => {
    const signResult = await privateWallet.toPrivateBuild({
      assetId: balance.assetType.assetId,
      amount: balance.valueAtomicUnits.toString(),
      polkadotAddress: publicAddress,
      network
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }

    const batches = [];
    for (let index = 0; index < signResult.length; index++) {
      const sign = signResult[index];
      const tx = api.tx(sign);
      batches.push(tx);
    }

    await publishBatchesSequentially(batches, txResHandler);
  };

  const value = useMemo(
    () => ({
      // isReady,
      // privateAddress,
      getSpendableBalance,
      toPrivate,
      toPublic,
      privateTransfer,
      privateWallet,
      // sync,
      // signerIsConnected,
      // signerVersion,
      isInitialSync
      // setBalancesAreStale,
      // balancesAreStale,
      // balancesAreStaleRef
    }),
    [isInitialSync, getSpendableBalance, api, privateWallet, externalAccount]
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
