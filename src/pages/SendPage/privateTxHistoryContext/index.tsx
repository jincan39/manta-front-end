import React, { ReactNode, useEffect, createContext, useContext } from 'react';
import { default as axios, AxiosResponse, AxiosError } from 'axios';
import { useWallet } from 'hooks';
import {
  appendTxHistoryEvent,
  removePendingTxHistoryEvent,
  setPrivateTransactionHistory,
  getPrivateTransactionHistory,
  updateTxHistoryEventStatus
} from 'utils/persistence/privateTransactionHistory';
import {
  getLastSeenPrivateAddress,
  setLastSeenPrivateAddress
} from 'utils/persistence/privateAddressHistory';
import TxHistoryEvent, {
  HISTORY_EVENT_STATUS,
  PRIVATE_TX_TYPE
} from 'types/TxHistoryEvent';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import { useSend } from '../SendContext';

type PrivateTxHistoryContextProps = {
  children: ReactNode;
};

const PENDING_TX_MAX_WAIT_MS = 200000;
const PrivateTxHistoryContext = createContext({});

export const PrivateTxHistoryContextProvider = (
  props: PrivateTxHistoryContextProps
) => {
  const config = useConfig();
  const { txStatus, txStatusRef } = useTxStatus();
  const { privateAddress } = useWallet();
  const {
    isToPublic,
    isToPrivate,
    isPrivateTransfer,
    senderAssetTargetBalance
  } = useSend();

  const getTransactionType = () => {
    if (isPrivateTransfer()) {
      return PRIVATE_TX_TYPE.PRIVATE_TRANSFER;
    } else if (isToPrivate()) {
      return PRIVATE_TX_TYPE.TO_PRIVATE;
    }
    return PRIVATE_TX_TYPE.TO_PUBLIC;
  };

  useEffect(() => {
    const updateTxHistoryOnNewTransaction = () => {
      if (
        (isPrivateTransfer() || isToPrivate() || isToPublic()) &&
        txStatus?.isProcessing() &&
        txStatus?.extrinsic
      ) {
        const txHistoryEvent = new TxHistoryEvent(
          config.NETWORK_NAME,
          senderAssetTargetBalance,
          txStatus.extrinsic,
          config.SUBSCAN_URL,
          getTransactionType()
        );
        appendTxHistoryEvent(txHistoryEvent);
      }
    };
    updateTxHistoryOnNewTransaction();
  }, [txStatus]);

  /**
   * Update history event status When page loads
   */

  const getPendingHistoryEvents = () => {
    return getPrivateTransactionHistory(config.NETWORK_NAME).filter(
      (tx) => tx.status === HISTORY_EVENT_STATUS.PENDING
    );
  };

  const syncPendingHistoryEvents = async () => {
    const pendingHistoryEvents = getPendingHistoryEvents();

    await pendingHistoryEvents.forEach(async (tx) => {
      const response: void | AxiosResponse = await axios
        .post(`${config.SUBSCAN_API_ENDPOINT}/extrinsic`, {
          hash: tx.extrinsicHash
        })
        .catch((error: AxiosError) => {
          console.log(error);
        });
      const data = response?.data.data;
      if (data) {
        const status = data?.error
          ? HISTORY_EVENT_STATUS.FAILED
          : HISTORY_EVENT_STATUS.SUCCESS;
        updateTxHistoryEventStatus(status, tx.extrinsicHash);
      } else {
        const createdTime = new Date(tx.date).getTime();
        const currentTime = new Date().getTime();
        if (currentTime - createdTime > PENDING_TX_MAX_WAIT_MS) {
          removePendingTxHistoryEvent(tx.extrinsicHash);
        }
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        getPendingHistoryEvents().length !== 0 &&
        !txStatusRef.current?.isProcessing()
      ) {
        syncPendingHistoryEvents();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Reset Private Transaction History When private address change
   */

  useEffect(() => {
    const resetHistoryEvents = () => {
      if (privateAddress && privateAddress !== getLastSeenPrivateAddress()) {
        setLastSeenPrivateAddress(privateAddress);
        setPrivateTransactionHistory([]);
      }
    };
    resetHistoryEvents();
  }, [privateAddress]);

  return (
    <PrivateTxHistoryContext.Provider value={{}}>
      {props.children}
    </PrivateTxHistoryContext.Provider>
  );
};

export const usePrivateTxHistory = () => ({
  ...useContext(PrivateTxHistoryContext)
});
