// @ts-nocheck
import React, { useReducer, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSubstrate } from 'contexts/substrateContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import Balance from 'types/Balance';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import BN from 'bn.js';
import { useTxStatus } from 'contexts/txStatusContext';
import TxStatus from 'types/TxStatus';
import AssetType from 'types/AssetType';
import extrinsicWasSentByUser from 'utils/api/ExtrinsicWasSendByUser';
import { useConfig } from 'contexts/configContext';
import { MantaPrivateWallet, MantaUtilities } from 'manta.js';
import SEND_ACTIONS from './sendActions';
import sendReducer, { buildInitState } from './sendReducer';

const SendContext = React.createContext();

export const SendContextProvider = (props) => {
  const config = useConfig();
  const { api } = useSubstrate();
  const { setTxStatus, txStatus } = useTxStatus();
  const {
    externalAccount,
    externalAccountSigner
  } = useExternalAccount();
  const privateWallet = usePrivateWallet();
  const { isReady: privateWalletIsReady, privateAddress } = privateWallet;
  const [state, dispatch] = useReducer(sendReducer, buildInitState(config));
  const {
    senderAssetType,
    senderAssetCurrentBalance,
    senderAssetTargetBalance,
    senderNativeTokenPublicBalance,
    senderPublicAccount,
    receiverAssetType,
    receiverAddress
  } = state;


  /**
   * Initialization logic
   */

  // Adds the user's default private address to state on pageload
  useEffect(() => {
    const initSenderPrivateAddress = () => {
      dispatch({
        type: SEND_ACTIONS.SET_SENDER_PRIVATE_ADDRESS,
        senderPrivateAddress: privateAddress
      });
    };
    initSenderPrivateAddress();
    if (privateAddress && isToPrivate()) {
      setReceiver(privateAddress);
    }
  }, [privateAddress]);

  // Initializes the receiving address
  useEffect(() => {
    const initReceiver = (receiverAddress) => {
      dispatch({
        type: SEND_ACTIONS.SET_RECEIVER,
        receiverAddress
      });
    };
    if (!receiverAddress && isToPublic() && senderPublicAccount) {
      initReceiver(senderPublicAccount.address);
    } else if (!receiverAddress && isToPrivate() && privateAddress) {
      initReceiver(privateAddress);
    }
  }, [privateAddress, senderPublicAccount]);

  useEffect(() => {
    const resetReceivingAddressOnSignerDisconnect = () => {
      if (isToPrivate() && !privateAddress) {
        dispatch({
          type: SEND_ACTIONS.SET_RECEIVER,
          receiverAddress: null
        });
      }
    };
    resetReceivingAddressOnSignerDisconnect();
  }, [privateAddress]);

  /**
   * External state
   */

  // Synchronizes the user's current 'active' public account in local state
  // to macth its upstream source of truth in `externalAccountContext`
  // The active `senderPublicAccount` receivs `toPublic` payments,
  // send `toPrivate` and `publicTransfer` payments, and covers fees for all payments
  useEffect(() => {
    const syncPublicAccountToExternalAccount = () => {
      dispatch({
        type: SEND_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT,
        senderPublicAccount: externalAccount
      });
    };
    syncPublicAccountToExternalAccount();
  }, [externalAccount]);

  /**
   *
   * Mutations exposed through UI
   */

  // Toggles the private/public status of the sender's account
  const toggleSenderIsPrivate = () => {
    dispatch({ type: SEND_ACTIONS.TOGGLE_SENDER_ACCOUNT_IS_PRIVATE });
  };

  // Toggles the private/public status of the receiver's account
  const toggleReceiverIsPrivate = () => {
    dispatch({
      type: SEND_ACTIONS.TOGGLE_RECEIVER_ACCOUNT_IS_PRIVATE
    });
  };

  const swapSenderAndReceiverArePrivate = () => {
    dispatch({
      type: SEND_ACTIONS.SWAP_SENDER_AND_RECEIVER_ACCOUNTS_ARE_PRIVATE
    });
  };

  // Sets the asset type to be transacted
  const setSelectedAssetType = (selectedAssetType) => {
    dispatch({ type: SEND_ACTIONS.SET_SELECTED_ASSET_TYPE, selectedAssetType });
  };

  // Sets the balance the user intends to send
  const setSenderAssetTargetBalance = (senderAssetTargetBalance) => {
    dispatch({
      type: SEND_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE,
      senderAssetTargetBalance
    });
  };

  // Sets the intended recipient of the transaction, whether public or private
  const setReceiver = (receiverAddress) => {
    dispatch({
      type: SEND_ACTIONS.SET_RECEIVER,
      receiverAddress
    });
  };

  /**
   *
   * Balance refresh logic
   */

  // Dispatches the receiver's balance in local state if the user would be sending a payment internally
  // i.e. if the user is sending a `To Private` or `To Public` transaction
  const setReceiverCurrentBalance = (receiverCurrentBalance) => {
    dispatch({
      type: SEND_ACTIONS.SET_RECEIVER_CURRENT_BALANCE,
      receiverCurrentBalance
    });
  };

  // Dispatches the user's available balance to local state for the currently selected account and asset
  const setSenderAssetCurrentBalance = (
    senderAssetCurrentBalance,
    senderPublicAddress
  ) => {
    dispatch({
      type: SEND_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE,
      senderAssetCurrentBalance,
      senderPublicAddress
    });
  };

  // Dispatches the user's available public balance for the currently selected fee-paying account to local state
  const setSenderNativeTokenPublicBalance = (
    senderNativeTokenPublicBalance
  ) => {
    dispatch({
      type: SEND_ACTIONS.SET_SENDER_NATIVE_TOKEN_PUBLIC_BALANCE,
      senderNativeTokenPublicBalance
    });
  };

  // Gets available public balance for some public address and asset type
  const fetchPublicBalance = async (address, assetType) => {
    if (!api?.isConnected || !address || !assetType) {
      return null;
    }
    const balanceRaw = await MantaUtilities.getPublicBalance(
      api, new BN(assetType.assetId), address
    );
    const balance = balanceRaw ? new Balance(assetType, balanceRaw) : null;
    return balance;
  };

  // Gets available native public balance for some public address;
  // This is currently a special case because querying native token balnces
  // requires a different api call
  const fetchNativeTokenPublicBalance = async (address) => {
    if (!api?.isConnected || !address) {
      return null;
    }
    const balance = await api.query.system.account(address);
    return Balance.Native(config, new BN(balance.data.free.toString()));
  };

  // Gets the available balance for the currently selected sender account, whether public or private
  const fetchSenderBalance = async () => {
    if (!senderAssetType.isPrivate) {
      const publicBalance = await fetchPublicBalance(
        senderPublicAccount?.address,
        senderAssetType
      );
      setSenderAssetCurrentBalance(publicBalance, senderPublicAccount?.address);
      // private balances cannot be queries while a transaction is processing
      // because web assambly wallet panics if asked to do two things at a time
    } else if (senderAssetType.isPrivate && !txStatus?.isProcessing()) {
      const privateBalance = await privateWallet.getSpendableBalance(
        senderAssetType
      );
      setSenderAssetCurrentBalance(
        privateBalance,
        senderPublicAccount?.address
      );
    }
  };

  // Gets the available balance for the currently selected sender account, whether public or private
  // if the user would be sending a payment internally i.e. if the user is sending a `To Private` or `To Public` transaction
  const fetchReceiverBalance = async () => {
    // Send pay doesn't display receiver balances if the receiver is external
    if (isPrivateTransfer()) {
      setReceiverCurrentBalance(null);
      // private balances cannot be queried while a transaction is processing
      // because the private web assambly wallet panics if asked to do two things at a time
    } else if (isToPrivate() && !txStatus?.isProcessing()) {
      const privateBalance = await privateWallet.getSpendableBalance(
        receiverAssetType
      );
      setReceiverCurrentBalance(privateBalance);
    } else if (receiverIsPublic()) {
      const publicBalance = await fetchPublicBalance(
        receiverAddress,
        receiverAssetType
      );
      setReceiverCurrentBalance(publicBalance);
    }
  };

  // Gets the available public balance for the user's public account set to pay transaction fee
  const fetchFeeBalance = async () => {
    if (!api?.isConnected || !externalAccount) {
      return;
    }
    const address = externalAccount.address;
    const balance = await fetchNativeTokenPublicBalance(address);
    setSenderNativeTokenPublicBalance(balance, address);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (txStatus?.isProcessing()) {
        return;
      }
      fetchSenderBalance();
      fetchReceiverBalance();
      fetchFeeBalance();
    }, 1000);
    return () => clearInterval(interval);
  }, [
    senderAssetType,
    externalAccount,
    receiverAddress,
    senderPublicAccount,
    receiverAssetType,
    api,
    privateWalletIsReady,
    txStatus
  ]);

  /**
   *
   * Transaction validation
   */

  // Gets the highest amount the user is allowed to send for the currently
  // selected asset
  const getMaxSendableBalance = () => {
    if (!senderAssetCurrentBalance || !senderNativeTokenPublicBalance) {
      return null;
    }
    if (senderAssetType.isNativeToken && !senderAssetType.isPrivate) {
      const reservedNativeTokenBalance = getReservedNativeTokenBalance();
      const zeroBalance = new Balance(senderAssetType, new BN(0));
      return Balance.max(
        senderAssetCurrentBalance.sub(reservedNativeTokenBalance),
        zeroBalance
      );
    }
    return senderAssetCurrentBalance.valueOverExistentialDeposit();
  };

  // Gets the amount of the native token the user is not allowed to go below
  // If the user attempts a transaction with less than this amount of the
  // native token, the transaction will fail
  const getReservedNativeTokenBalance = () => {
    if (!senderNativeTokenPublicBalance) {
      return null;
    }
    const conservativeFeeEstimate = Balance.fromBaseUnits(AssetType.Native(config), 50);
    const existentialDeposit = Balance.Native(config, AssetType.Native(config).existentialDeposit);
    return conservativeFeeEstimate.add(existentialDeposit);
  };

  // Returns true if the current tx would cause the user to go below a
  // recommended min fee balance of 150. This helps prevent users from
  // accidentally becoming unable to transact because they cannot pay fees
  const txWouldDepleteSuggestedMinFeeBalance = () => {
    if (
      senderAssetCurrentBalance?.assetType.isNativeToken &&
      senderAssetTargetBalance?.assetType.isNativeToken &&
      (isToPrivate() || isPublicTransfer())
    ) {
      const SUGGESTED_MIN_FEE_BALANCE = Balance.fromBaseUnits(AssetType.Native(config), 150);
      const balanceAfterTx = senderAssetCurrentBalance.sub(senderAssetTargetBalance);
      return SUGGESTED_MIN_FEE_BALANCE.gte(balanceAfterTx);
    }
    return false;
  };

  // Checks if the user has enough funds to pay for a transaction
  const userHasSufficientFunds = () => {
    if (
      !senderAssetTargetBalance
      || !senderAssetCurrentBalance
      || !senderNativeTokenPublicBalance
    ) {
      return null;
    } else if (
      senderAssetTargetBalance.assetType.assetId !==
      senderAssetCurrentBalance.assetType.assetId
    ) {
      return null;
    }
    const maxSendableBalance = getMaxSendableBalance();
    return maxSendableBalance.gte(senderAssetTargetBalance);
  };

  // Checks if the user has enough native token to pay fees & publish a transaction
  const userCanPayFee = () => {
    if (!senderNativeTokenPublicBalance || !senderAssetTargetBalance) {
      return null;
    }
    let requiredNativeTokenBalance = getReservedNativeTokenBalance();
    if (senderAssetType.isNativeToken && !senderAssetType.isPrivate) {
      requiredNativeTokenBalance = requiredNativeTokenBalance.add(
        senderAssetTargetBalance
      );
    }
    return senderNativeTokenPublicBalance.gte(requiredNativeTokenBalance);
  };

  // Checks the user is sending at least the existential deposit
  const receiverAmountIsOverExistentialBalance = () => {
    if (!senderAssetTargetBalance) {
      return null;
    }
    return senderAssetTargetBalance.valueAtomicUnits.gte(
      receiverAssetType.existentialDeposit
    );
  };

  // Checks that it is valid to attempt a transaction
  const isValidToSend = () => {
    return (
      (privateWallet.isReady || isPublicTransfer()) &&
      api &&
      externalAccountSigner &&
      receiverAddress &&
      senderAssetTargetBalance &&
      senderAssetCurrentBalance &&
      userHasSufficientFunds() &&
      userCanPayFee() &&
      receiverAmountIsOverExistentialBalance()
    );
  };

  /**
   *
   * Transaction logic
   */

  // Handles the result of a transaction
  const handleTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed());
          console.error('Transaction failed', event);
        }
      }
    } else if (status.isFinalized) {
      try {
        const signedBlock = await api.rpc.chain.getBlock(status.asFinalized);
        const extrinsics = signedBlock.block.extrinsics;
        const extrinsic = extrinsics.find((extrinsic) =>
          extrinsicWasSentByUser(extrinsic, externalAccount, api)
        );
        const extrinsicHash = extrinsic.hash.toHex();
        setTxStatus(TxStatus.finalized(extrinsicHash, config.SUBSCAN_URL));
        // Correct private balances will only appear after a sync has completed
        // Until then, do not display stale balances
        privateWallet.setBalancesAreStale(true);
        senderAssetType.isPrivate && setSenderAssetCurrentBalance(null);
        receiverAssetType.isPrivate && setReceiverCurrentBalance(null);
      } catch(error) {
        console.error(error);
      }
    }
  };

  // Attempts to build and send a transaction
  const send = async () => {
    if (!isValidToSend()) {
      return;
    }
    setTxStatus(TxStatus.processing());
    if (isPrivateTransfer()) {
      await privateTransfer(state);
    } else if (isPublicTransfer()) {
      await publicTransfer(state);
    } else if (isToPrivate()) {
      await toPrivate(state);
    } else if (isToPublic()) {
      await toPublic(state);
    }
  };

  // Attempts to build and send an internal transaction minting public tokens to private tokens
  const toPrivate = async () => {
    await privateWallet.toPrivate(
      state.senderAssetTargetBalance,
      handleTxRes
    );
  };

  // Attempts to build and send an internal transaction reclaiming private tokens to public tokens
  const toPublic = async () => {
    await privateWallet.toPublic(
      state.senderAssetTargetBalance,
      handleTxRes
    );
  };

  // Attempts to build and send a transaction to some private account
  const privateTransfer = async () => {
    const { senderAssetTargetBalance, receiverAddress } = state;
    await privateWallet.privateTransfer(
      senderAssetTargetBalance,
      receiverAddress,
      handleTxRes
    );
  };

  const buildPublicTransfer = async (senderAssetTargetBalance, receiverAddress) => {
    const assetId = senderAssetTargetBalance.assetType.assetId;
    const valueAtomicUnits = senderAssetTargetBalance.valueAtomicUnits;
    const assetIdArray = Array.from(MantaPrivateWallet.assetIdToUInt8Array(new BN(assetId)));
    const valueArray = valueAtomicUnits.toArray('le', 16);
    const tx = await api.tx.mantaPay.publicTransfer(
      { id: assetIdArray, value: valueArray },
      receiverAddress
    );
    return tx;
  };

  // Attempts to build and send a transaction to some public account
  const publicTransfer = async () => {
    const tx = await buildPublicTransfer(senderAssetTargetBalance, receiverAddress);
    try {
      await tx.signAndSend(externalAccountSigner, handleTxRes);
    } catch (e) {
      console.error('Failed to send transaction', e);
      setTxStatus(TxStatus.failed('Transaction declined'));
    }
  };

  const isToPrivate = () => {
    return !senderAssetType?.isPrivate && receiverAssetType?.isPrivate;
  };

  const isToPublic = () => {
    return senderAssetType?.isPrivate && !receiverAssetType?.isPrivate;
  };

  const isPrivateTransfer = () => {
    return senderAssetType?.isPrivate && receiverAssetType?.isPrivate;
  };

  const isPublicTransfer = () => {
    return !senderAssetType?.isPrivate && !receiverAssetType?.isPrivate;
  };

  const senderIsPrivate = () => {
    return isPrivateTransfer() || isToPublic();
  };

  const senderIsPublic = () => {
    return isPublicTransfer() || isToPrivate();
  };

  const receiverIsPrivate = () => {
    return isPrivateTransfer() || isToPrivate();
  };

  const receiverIsPublic = () => {
    return isPublicTransfer() || isToPublic();
  };

  const value = {
    userHasSufficientFunds,
    userCanPayFee,
    getMaxSendableBalance,
    receiverAmountIsOverExistentialBalance,
    txWouldDepleteSuggestedMinFeeBalance,
    isValidToSend,
    setSenderAssetTargetBalance,
    toggleSenderIsPrivate,
    toggleReceiverIsPrivate,
    swapSenderAndReceiverArePrivate,
    setSelectedAssetType,
    setReceiver,
    send,
    isPrivateTransfer,
    isPublicTransfer,
    isToPrivate,
    isToPublic,
    senderIsPrivate,
    receiverIsPrivate,
    senderIsPublic,
    ...state
  };

  return (
    <SendContext.Provider value={value}>{props.children}</SendContext.Provider>
  );
};

SendContextProvider.propTypes = {
  children: PropTypes.any
};

export const useSend = () => ({ ...useContext(SendContext) });
