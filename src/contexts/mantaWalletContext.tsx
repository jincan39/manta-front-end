// @ts-nocheck
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
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import TxStatus from 'types/TxStatus';
import { removePendingTxHistoryEvent } from 'utils/persistence/privateTransactionHistory';
import { useConfig } from './configContext';
import { useKeyring } from './keyringContext';
import { usePublicAccount } from './publicAccountContext';
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
  const { setTxStatus, txStatusRef } = useTxStatus();
  const { selectedWallet } = useKeyring();

  // private wallet
  const [privateWallet, setPrivateWallet] = useState(null);
  const signerIsConnected = !!privateWallet;
  const [privateAddress, setPrivateAddress] = useState(null);
  const [isReady, setIsReady] = useState(null);
  const isInitialSync = useRef(true);

  // transaction state
  const txQueue = useRef([]);
  const finalTxResHandler = useRef(null);

  useEffect(() => {
    let unsub;
    if (privateWallet) {
      unsub = privateWallet.subscribeWalletState((state) => {
        const { isWalletReady } = state;
        setIsReady(isWalletReady);
      });
    }
    return unsub && unsub();
  }, [privateWallet]);

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
      isInitialSync.current = false; // privateWallet handles initialWalletSync
      setPrivateWallet(selectedWallet.extension.privateWallet);
    }
  }, [selectedWallet]);

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
        return res;
      } catch (error) {
        console.error('error getting zkBalance', error);
        return null;
      }
    },
    [privateWallet]
  );

  const sync = async () => {
    await privateWallet.walletSync();
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isReady) {
        sync();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isReady]);

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

  const getBatches = async (signResult) => {
    const batches = [];
    for (let index = 0; index < signResult.length; index++) {
      const sign = signResult[index];
      const tx = api.tx(sign);
      batches.push(tx);
    }
    return batches;
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

    const batches = await getBatches(signResult);
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

    const batches = await getBatches(signResult);
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

    const batches = await getBatches(signResult);
    await publishBatchesSequentially(batches, txResHandler);
  };

  const value = useMemo(
    () => ({
      isReady,
      privateAddress,
      getSpendableBalance,
      toPrivate,
      toPublic,
      privateTransfer,
      privateWallet,
      sync,
      isInitialSync,
      signerIsConnected
    }),
    [
      api,
      externalAccount,
      isReady,
      privateAddress,
      getSpendableBalance,
      toPrivate,
      toPublic,
      privateTransfer,
      privateWallet,
      isInitialSync,
      signerIsConnected
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
