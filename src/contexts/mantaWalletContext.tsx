import { SubmittableExtrinsic } from '@polkadot/api/types';
import { EventRecord, ExtrinsicStatus } from '@polkadot/types/interfaces';
import { BN } from 'bn.js';
import {
  MutableRefObject,
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
import isObjectEmpty from 'utils/validation/isEmpty';
import { useConfig } from './configContext';
import { useKeyring } from './keyringContext';
import { PrivateWallet } from './mantaWalletType';
import { usePublicAccount } from './publicAccountContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';

type txResHandlerType<T, E = undefined> = (
  result: T,
  extra: E
) => void | Promise<void>;

type MantaWalletContext = {
  isReady: boolean;
  privateAddress: string;
  getSpendableBalance: (asset: AssetType) => Promise<Balance | null>;
  toPrivate: (balance: Balance, txResHandler: any) => Promise<void>;
  toPublic: (balance: Balance, txResHandler: any) => Promise<void>;
  privateTransfer: (
    balance: Balance,
    receiveZkAddress: string,
    txResHandler: txResHandlerType<any>
  ) => Promise<void>;
  privateWallet: PrivateWallet;
  sync: () => Promise<void>;
  isInitialSync: MutableRefObject<boolean>;
  signerIsConnected: boolean;
};

const MantaWalletContext = createContext<MantaWalletContext | null>(null);

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
  const [privateWallet, setPrivateWallet] = useState<PrivateWallet>(
    {} as PrivateWallet
  );

  const signerIsConnected = !isObjectEmpty(privateWallet);
  const [privateAddress, setPrivateAddress] = useState('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const isInitialSync = useRef(true);

  // transaction state
  const txQueue = useRef<SubmittableExtrinsic<'promise', any>[]>([]);
  const finalTxResHandler = useRef<txResHandlerType<any> | null>(null);

  useEffect(() => {
    let unsub;
    if (!isObjectEmpty(privateWallet)) {
      unsub = privateWallet.subscribeWalletState((state) => {
        const { isWalletReady } = state;
        setIsReady(isWalletReady);
      });
    }
    return unsub && unsub();
  }, [privateWallet]);

  useEffect(() => {
    const getZkAddress = async () => {
      if (isObjectEmpty(selectedWallet) || isObjectEmpty(privateWallet)) {
        return;
      }
      const accounts = await selectedWallet.getAccounts();
      if (!accounts || accounts.length <= 0) {
        return;
      }
      // @ts-ignore
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
          assetId: `${assetType.assetId}`
        });
        const res = new Balance(assetType, new BN(balanceRaw || 0));
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
  const handleInternalTxRes = async ({
    status,
    events
  }: {
    status: ExtrinsicStatus;
    events: EventRecord[];
  }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed('Transaction failed'));
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
        const lastTx: any = txQueue.current.shift();
        if (!lastTx) {
          console.error(new Error('can not get lastTx'));
          setTxStatus(TxStatus.failed(''));
          return;
        }
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
        const internalTx: any = txQueue.current.shift();
        await internalTx.signAndSend(publicAddress, handleInternalTxRes);
      } catch (e) {
        setTxStatus(TxStatus.failed('internalTx failed'));
        txQueue.current = [];
      }
    };

    if (txQueue.current.length === 0) {
      return;
    } else if (txQueue.current.length === 1) {
      sendExternal();
    } else {
      sendInternal();
    }
  };

  // todo: deduplicate logic shared between this and the signer wallet context
  const publishBatchesSequentially = async (
    batches: SubmittableExtrinsic<'promise', any>[],
    txResHandler: txResHandlerType<any>
  ) => {
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

  const getBatches = async (signResult: string[]) => {
    const batches = [];
    for (let index = 0; index < signResult.length; index++) {
      const sign = signResult[index];
      const tx = api.tx(sign);
      batches.push(tx);
    }
    return batches;
  };

  const toPublic = async (balance: Balance, txResHandler: any) => {
    const signResult = await privateWallet.toPublicBuild({
      assetId: `${balance.assetType.assetId}`,
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

  const privateTransfer = async (
    balance: Balance,
    receiveZkAddress: string,
    txResHandler: txResHandlerType<any>
  ) => {
    const signResult = await privateWallet.privateTransferBuild({
      assetId: `${balance.assetType.assetId}`,
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

  const toPrivate = async (
    balance: Balance,
    txResHandler: txResHandlerType<any>
  ) => {
    const signResult = await privateWallet.toPrivateBuild({
      assetId: `${balance.assetType.assetId}`,
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
