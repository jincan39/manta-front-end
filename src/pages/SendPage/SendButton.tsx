// @ts-nocheck
import React, { useMemo } from 'react';
import classNames from 'classnames';
import MantaLoading from 'components/Loading';
import { useTxStatus } from 'contexts/txStatusContext';
import { showError } from 'utils/ui/Notifications';
import Balance from 'types/Balance';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { usePrivateWalletSync } from 'contexts/privateWalletSyncContext';
import { useSubstrate } from 'contexts/substrateContext';
import SyncPercentage from 'components/Loaders/SyncPercentage';
import { useSend } from './SendContext';

const SendButton = () => {
  const {
    isToPrivate,
    isToPublic,
    isPublicTransfer,
    isPrivateTransfer,
    userCanPayFee,
    receiverAssetType,
    receiverAmountIsOverExistentialBalance
  } = useSend();
  const { apiState } = useSubstrate();
  const { signerIsConnected, isReady, isInitialSync } =
    usePrivateWallet();
  const { syncPercentage, syncError } = usePrivateWalletSync();
  const { txStatus } = useTxStatus();
  const { send } = useSend();
  const disabled = txStatus?.isProcessing();

  const onClick = () => {
    if (receiverAmountIsOverExistentialBalance() === false) {
      const existentialDeposit = new Balance(
        receiverAssetType,
        receiverAssetType.existentialDeposit
      );
      showError(
        `Minimum ${
          receiverAssetType.ticker
        } transaction is ${existentialDeposit.toString()}`
      );
    } else if (userCanPayFee() === false) {
      showError('Cannot pay transaction fee; deposit DOL to transact');
    } else if (!disabled) {
      send();
    }
  };

  let buttonLabel;
  if (isToPrivate()) {
    buttonLabel = 'To Private';
  } else if (isToPublic()) {
    buttonLabel = 'To Public';
  } else if (isPublicTransfer()) {
    buttonLabel = 'Public Transfer';
  } else if (isPrivateTransfer()) {
    buttonLabel = 'Private Transfer';
  }

  const shouldShowSyncPercentage =
    !syncError.current &&
    apiState !== 'ERROR' &&
    signerIsConnected &&
    isInitialSync.current &&
    (isPrivateTransfer() || isToPublic() || isToPrivate());

  const errorLabel = useMemo(() => {
    if (syncError.current) return 'Failed to sync to the node';
    else if (apiState === 'ERROR') return 'Failed to connect to the node';
    else if (
      !isReady &&
      signerIsConnected === false &&
      (isPrivateTransfer() || isToPublic() || isToPrivate())
    )
      return 'Failed to connect to the signer';
    return '';
  }, [
    syncError.current,
    apiState,
    signerIsConnected,
    isReady,
    isPrivateTransfer,
    isToPrivate,
    isToPublic
  ]);

  return (
    <div>
      {txStatus?.isProcessing() ? (
        <MantaLoading className="py-4" />
      ) : shouldShowSyncPercentage ? (
        <SyncPercentage percentage={syncPercentage} />
      ) : errorLabel ? (
        <div className="text-center">
          <p className="text-red-500">{errorLabel}</p>
        </div>
      ) : (
        <button
          id="sendButton"
          onClick={onClick}
          className={classNames(
            'py-3 cursor-pointer text-xl btn-hover unselectable-text',
            'text-center rounded-full btn-primary w-full',
            { disabled: disabled }
          )}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default SendButton;
