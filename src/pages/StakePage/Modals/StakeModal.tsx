// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import GradientText from 'components/GradientText';
import AssetType from 'types/AssetType';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import Balance from 'types/Balance';
import ErrorText from 'components/Error/ErrorText';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import DotLoader from 'components/Loaders/DotLoader';
import Icon from 'components/Icon';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { useStakeTx } from '../StakeContext/StakeTxContext';
import { MAX_DELEGATIONS } from '../StakeConstants';
import ModalNotes from './ModalNotes';

export const StakeModal = ({ hideModal }) => {
  const {
    selectedCollator,
    selectedCollatorDelegation,
    setStakeTargetBalance,
    stakeTargetBalance,
    userAvailableBalance,
    usdPerKma
  } = useStakeData();
  const {
    getMaxStakeableBalance,
    getUserCanStake,
    getUserHasSufficientFundsToStake,
    getUserWouldExceedMinStake,
    getUserWouldExceedMaxDelegations,
    stake
  } = useStakeTx();

  const config = useConfig();
  const { txStatus } = useTxStatus();
  const { externalAccount } = useExternalAccount();

  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const getBalanceDisplayString = (balance) => {
    if (!externalAccount) {
      return '';
    } else if (!balance) {
      return <DotLoader />;
    } else {
      return balance.toDisplayString(0);
    }
  };

  const availableBalanceText = `Available balance: ${getBalanceDisplayString(
    userAvailableBalance
  )}`;
  const minStakeAmountString = selectedCollator.minStake.toDisplayString(0);
  const delegationAmountText = selectedCollatorDelegation
    ? `Staked: ${selectedCollatorDelegation.delegatedBalance.toDisplayString(
      0
    )}`
    : 'Staked: 0 KMA';

  const minimumStakeText = ` Minimum stake: ${minStakeAmountString}`;

  const usdValueText =
    stakeTargetBalance && usdPerKma
      ? stakeTargetBalance.toUsd(usdPerKma).toString()
      : '';

  const notes = [
    'Staking rewards are paid to your address every six hours.',
    'Staking rewards are not automatically compounded.',
    'The unstaking process takes seven days.'
  ];

  useEffect(() => {
    const getErrorMessage = async () => {
      if (!externalAccount) {
        setErrorMessage('Wallet not connected');
      } else if (txStatus?.isProcessing()) {
        setErrorMessage('Transaction in progress');
      } else if (getUserWouldExceedMaxDelegations()) {
        setErrorMessage(`Max number of delegations is ${MAX_DELEGATIONS}`);
      } else if (
        !stakeTargetBalance ||
        !selectedCollator ||
        !userAvailableBalance
      ) {
        setErrorMessage(null);
      } else if (!(await getUserHasSufficientFundsToStake())) {
        setErrorMessage('Insufficient balance');
      } else if (!getUserWouldExceedMinStake()) {
        setErrorMessage(`Minimum is ${minStakeAmountString}`);
      } else {
        setErrorMessage(null);
      }
    };
    getErrorMessage();
  }, [
    selectedCollator,
    selectedCollatorDelegation,
    stakeTargetBalance,
    userAvailableBalance
  ]);

  const onClickStake = async () => {
    const userCanStake = await getUserCanStake();
    if (userCanStake) {
      stake();
      hideModal();
    }
  };

  const onChangeStakeAmountInput = (value) => {
    if (value === '') {
      setStakeTargetBalance(null);
      setInputValue('');
    } else {
      try {
        const targetBalance = Balance.fromBaseUnits(
          AssetType.Native(config),
          new Decimal(value)
        );
        setInputValue(value);
        if (targetBalance.valueAtomicUnits.gte(new BN(0))) {
          setStakeTargetBalance(targetBalance);
        } else {
          setStakeTargetBalance(null);
        }
      } catch (error) {
        return;
      }
    }
  };

  const onClickMax = async () => {
    const maxStakeableBalance = await getMaxStakeableBalance();
    if (maxStakeableBalance) {
      onChangeStakeAmountInput(maxStakeableBalance.toString());
    }
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
        <h1 className="text-secondary text-left text-sm font-medium">
          {availableBalanceText}
        </h1>
        <div
          className={`mt-2 px-4 pt-6 h-24 flex flex-wrap items-center rounded-lg border border-gray ${
            errorMessage ? 'border-red-500' : ''
          }`}>
          <Icon className="mr-3 w-7" name="calamari" />
          <input
            className="bg-fifth pl-1 flex-grow h-10 outline-none dark:text-white"
            placeholder="Amount"
            onChange={(e) => onChangeStakeAmountInput(e.target.value)}
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
      <ErrorText errorMessage={errorMessage} />
      <div className="mt-2 w-full">
        <Button className="w-full btn-primary" onClick={onClickStake}>
          Stake
        </Button>
      </div>
      <ModalNotes notes={notes} />
    </div>
  );
};

export default StakeModal;
