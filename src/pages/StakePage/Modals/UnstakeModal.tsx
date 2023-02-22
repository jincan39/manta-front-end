// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import GradientText from 'components/GradientText';
import Balance from 'types/Balance';
import AssetType from 'types/AssetType';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import ErrorText from 'components/Error/ErrorText';
import WarningText from 'components/Error/WarningText';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import Icon from 'components/Icon';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { useStakeTx } from '../StakeContext/StakeTxContext';
import ModalNotes from './ModalNotes';

export const UnstakeModal = ({ hideModal }) => {
  const {
    selectedCollator,
    selectedCollatorDelegation,
    setUnstakeTargetBalance,
    unstakeTargetBalance,
    userAvailableBalance,
    usdPerKma
  } = useStakeData();
  const {
    getUserCanUnstake,
    getUnstakeAmountIsOverZero,
    getUserHasSufficientFreeFundsToUnstake,
    getUserHasSufficientStakedFundsToUnstake,
    getUnstakeWouldBeBelowDelegationThreshold,
    unstake
  } = useStakeTx();

  const config = useConfig();
  const { externalAccount } = useExternalAccount();
  const { txStatus } = useTxStatus();

  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  const delegationAmountText = selectedCollatorDelegation
    ? `Staked: ${selectedCollatorDelegation.delegatedBalance.toDisplayString(
      0
    )}`
    : 'Staked: 0 KMA';

  const minimumStakeAmountString = selectedCollator.minStake.toDisplayString(0);
  const minimumStakeText = ` Minimum stake: ${minimumStakeAmountString}`;

  const usdValueText =
    unstakeTargetBalance && usdPerKma
      ? unstakeTargetBalance.toUsd(usdPerKma).toString()
      : '';

  const notes = [
    'The unstaking process takes seven days. After seven days you can withdraw your tokens.',
    'Unstaked tokens will no longer earn staking rewards.'
  ];

  useEffect(() => {
    const getErrorMessage = async () => {
      if (!externalAccount) {
        setErrorMessage('Wallet not connected');
      } else if (txStatus?.isProcessing()) {
        setErrorMessage('Transaction in progress');
      } else if (
        !unstakeTargetBalance ||
        !selectedCollator ||
        !userAvailableBalance
      ) {
        setErrorMessage(null);
      } else if (!getUnstakeAmountIsOverZero()) {
        setErrorMessage('Cannot unstake zero balance');
      } else if (!(await getUserHasSufficientFreeFundsToUnstake())) {
        setErrorMessage('Insufficient balance to pay fees');
      } else if (!(await getUserHasSufficientStakedFundsToUnstake())) {
        setErrorMessage('Cannot unstake more than staked balance');
      } else {
        setErrorMessage(null);
      }
    };
    const getWarningMessage = () => {
      if (getUnstakeWouldBeBelowDelegationThreshold()) {
        setWarningMessage('Full balance will unstake');
      } else {
        setWarningMessage(null);
      }
    };
    getErrorMessage();
    getWarningMessage();
  }, [
    selectedCollator,
    selectedCollatorDelegation,
    unstakeTargetBalance,
    userAvailableBalance
  ]);

  const onClickUnstake = async () => {
    const userCanUnstake = await getUserCanUnstake();
    if (userCanUnstake) {
      unstake();
      hideModal();
    }
  };

  const onChangeUnstakeAmountInput = (value) => {
    if (value === '') {
      setUnstakeTargetBalance(null);
      setInputValue('');
    } else {
      try {
        const targetBalance = Balance.fromBaseUnits(
          AssetType.Native(config),
          new Decimal(value)
        );
        setInputValue(value);
        if (targetBalance.valueAtomicUnits.gte(new BN(0))) {
          setUnstakeTargetBalance(targetBalance);
        } else {
          setUnstakeTargetBalance(null);
        }
      } catch (error) {
        return;
      }
    }
  };

  const onClickMax = async () => {
    const maxUnstakeableBalance =
      selectedCollatorDelegation.delegatedBalance.toString();
    onChangeUnstakeAmountInput(maxUnstakeableBalance);
  };

  return (
    <div className="w-96 py-4 bg-fifth rounded-2xl">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-secondary text-lg">
          {selectedCollator.name}
        </h1>
      </div>
      <div className="mt-4">
        <h1 className="text-secondary text-left text-sm font-medium">
          {delegationAmountText}
        </h1>
        <h1 className="text-secondary text-left text-sm font-medium">
          {minimumStakeText}
        </h1>
        <div
          className={`mt-6 px-4 pt-6 h-24 flex flex-wrap items-center rounded-lg border border-gray ${
            errorMessage ? 'border-red-500' : ''
          }`}>
          <Icon className="mr-3 w-7" name="calamari" />
          <input
            className="bg-fifth pl-1 flex-grow h-10 outline-none dark:text-white"
            placeholder="Amount"
            onChange={(e) => onChangeUnstakeAmountInput(e.target.value)}
            value={inputValue}
          />
          <div className="rounded-xl justify-self-end">
            <span onClick={onClickMax}>
              <GradientText className="text-link text-base" text="MAX" />
            </span>
          </div>
          <div className="w-full mb-2 text-xss pl-11 text-secondary">
            {usdValueText}
          </div>
          <br />
        </div>
      </div>
      {errorMessage ? (
        <ErrorText errorMessage={errorMessage} />
      ) : (
        <WarningText warningMessage={warningMessage} />
      )}

      <div className="mt-2 w-full">
        <Button className="w-full btn-primary" onClick={onClickUnstake}>
          Unstake
        </Button>
      </div>
      <ModalNotes notes={notes} />
    </div>
  );
};

export default UnstakeModal;
