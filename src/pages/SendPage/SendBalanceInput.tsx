// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { useSend } from 'pages/SendPage/SendContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';
import handleChangeBalanceInput from 'utils/validation/handleChangeBalanceInput';
import BalanceInput from '../../components/Balance/BalanceInput';

const SendBalanceInput = () => {
  const { apiState } = useSubstrate();
  const {
    senderAssetCurrentBalance,
    senderAssetTargetBalance,
    setSenderAssetTargetBalance,
    senderAssetType,
    senderIsPrivate,
    getMaxSendableBalance
  } = useSend();
  const { externalAccount } = useExternalAccount();
  const { privateAddress } = usePrivateWallet();
  const { isInitialSync } = usePrivateWallet();

  const [inputValue, setInputValue] = useState('');

  const apiIsDisconnected = apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;

  const balanceText = getZkTransactBalanceText(
    senderAssetCurrentBalance,
    apiIsDisconnected,
    senderIsPrivate(),
    isInitialSync.current
  );

  const shouldShowPublicLoader = Boolean(
    !senderAssetCurrentBalance && externalAccount?.address && !balanceText
  );
  const shouldShowPrivateLoader = Boolean(
    !senderAssetCurrentBalance && privateAddress && !balanceText
  );
  const shouldShowLoader = senderIsPrivate() ? shouldShowPrivateLoader : shouldShowPublicLoader;

  const onChangeSendAmountInput = (newInputValue) => {
    handleChangeBalanceInput(
      newInputValue,
      inputValue,
      setInputValue,
      setSenderAssetTargetBalance,
      senderAssetType
    );
  };

  useEffect(() => {
    const truncateDecimalsOnChangeAssetType = () => {
      senderAssetTargetBalance && onChangeSendAmountInput(senderAssetTargetBalance.toStringUnrounded());
    };
    truncateDecimalsOnChangeAssetType();
  }, [senderAssetType]);


  const onClickMax = () => {
    const maxSendableBalance = getMaxSendableBalance();
    if (maxSendableBalance) {
      onChangeSendAmountInput(maxSendableBalance.toString());
    }
  };

  return (
    <BalanceInput
      onChangeAmountInput={onChangeSendAmountInput}
      inputValue={inputValue}
      onClickMax={onClickMax}
      balanceText={balanceText}
      shouldShowLoader={shouldShowLoader}
    />
  );
};

export default SendBalanceInput;
