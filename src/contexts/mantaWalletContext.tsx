// @ts-nocheck

import { BN } from 'bn.js';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef
} from 'react';

import { usePublicAccount } from 'contexts/externalAccountContext';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import TxStatus from 'types/TxStatus';
import { removePendingTxHistoryEvent } from 'utils/persistence/privateTransactionHistory';
import { useConfig } from './configContext';
import { useKeyring } from './keyringContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';

const MantaWalletContext = createContext<null>(null);

export const MantaWalletContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const { api } = useSubstrate();
  const { NETWORK_NAME: network } = useConfig();
  const { selectedWallet } = useKeyring();
  const { externalAccount } = usePublicAccount();

  const isInitialSync = useRef(false);
  const privateWallet = selectedWallet?.extension?.privateWallet;
  const { setTxStatus } = useTxStatus();

  // transaction state
  const txQueue = useRef([]);
  const finalTxResHandler = useRef(null);

  const getAddress = async () => {
    const accounts = await selectedWallet?.getAccounts();
    if (!accounts || accounts.length <= 0) {
      return;
    }
    const { address: publicAddress, zkAddress } = accounts[0];
    return { publicAddress, zkAddress };
  };

  const getSpendableBalance = useCallback(
    async (assetType: AssetType) => {
      if (!privateWallet?.getZkBalance) {
        return null;
      }
      const decimals = '12'; // TODO
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

  const publishNextBatch = async () => {
    const sendExternal = async () => {
      try {
        const lastTx = txQueue.current.shift();
        await lastTx.signAndSend(
          externalAccountSigner,
          finalTxResHandler.current
        );
        setTxStatus(TxStatus.processing(null, lastTx.hash.toString()));
      } catch (e) {
        console.error('Error publishing private transaction batch', e);
        setTxStatus(TxStatus.failed('Transaction declined'));
        removePendingTxHistoryEvent();
        txQueue.current = [];
      }
    };

    const sendInternal = async () => {
      try {
        const internalTx = txQueue.current.shift();
        await internalTx.signAndSend(
          externalAccountSigner,
          handleInternalTxRes
        );
      } catch (e) {
        setTxStatus(TxStatus.failed());
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
      amount: balance.valueAtomicUnits,
      polkadotAddress: externalAccount?.meta?.address,
      network
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = signResult.txs;
    await publishBatchesSequentially(batches, txResHandler);
  };

  const privateTransfer = async (balance, receiveZkAddress, txResHandler) => {
    const { zkAddress } = await getAddress();
    const signResult = await privateWallet.privateTransferBuild({
      assetId: balance.assetType.assetId,
      amount: balance.valueAtomicUnits,
      polkadotAddress: externalAccount?.meta?.address,
      toZkAddress: zkAddress,
      network
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = signResult.txs;
    await publishBatchesSequentially(batches, txResHandler);
  };

  const toPrivate = async (balance: Balance, txResHandler) => {
    const signResult = await privateWallet.toPrivateBuild({
      assetId: balance.assetType.assetId,
      amount: balance.valueAtomicUnits,
      polkadotAddress: externalAccount?.meta?.address,
      network
    });
    if (signResult === null) {
      setTxStatus(TxStatus.failed('Transaction declined'));
      return;
    }
    const batches = signResult.txs;
    await publishBatchesSequentially(batches, txResHandler);
  };

  const value = useMemo(
    () => ({
      isInitialSync,
      getSpendableBalance,
      toPrivate,
      toPublic,
      privateTransfer
    }),
    [isInitialSync, getSpendableBalance]
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
