// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Balance from 'types/Balance';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { useSend } from 'pages/SendPage/SendContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useExternalAccount } from 'contexts/externalAccountContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';
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

  const inputValueIsTooLong = (value) => {
    const decimalIndex = value.indexOf('.');
    if (decimalIndex === -1) {
      return false;
    }
    const decimalPlaces = value.length - decimalIndex - 1;
    return decimalPlaces > senderAssetType?.numberOfDecimals;
  };

  const onChangeSendAmountInput = (value) => {
    if (value === '') {
      setSenderAssetTargetBalance(null);
      setInputValue('');
    } else if (inputValueIsTooLong(value)) {
      setInputValue(inputValue);
    } else {
      try {
        const targetBalance = Balance.fromBaseUnits(
          senderAssetType,
          new Decimal(value)
        );
        setInputValue(value);
        if (targetBalance.valueAtomicUnits.gt(new BN(0))) {
          setSenderAssetTargetBalance(targetBalance);
        } else {
          setSenderAssetTargetBalance(null);
        }
      } catch (error) {
        return;
      }
    }
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
