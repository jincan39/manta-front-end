import React from 'react';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import BalanceDisplay from 'components/Balance/BalanceDisplay';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';
import Icon from 'components/Icon';
import { useSend } from '../SendContext';

const ReceiverBalanceDisplay = () => {
  const {
    receiverAssetType,
    receiverCurrentBalance,
    receiverAddress,
    receiverIsPrivate,
    senderAssetTargetBalance
  } = useSend();
  const { isInitialSync } = usePrivateWallet();
  const { apiState } = useSubstrate();

  const apiIsDisconnected = apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;

  const balanceText = getZkTransactBalanceText(
    receiverCurrentBalance,
    apiIsDisconnected,
    receiverIsPrivate(),
    isInitialSync.current
  );

  const shouldShowLoader = receiverAddress && !receiverCurrentBalance && !balanceText;

  const targetBalanceString = senderAssetTargetBalance
    ? senderAssetTargetBalance.toStringUnrounded()
    : '0.00';

  return (
    <div className="relative gap-4 justify-between items-center px-4 py-2 manta-bg-gray rounded-lg h-20 mb-2">
      <div className="absolute left-4 bottom-7 p-2 cursor-default w-1/2 text-xl text-gray-500 overflow-hidden">
        {targetBalanceString}
      </div>
      <div className="absolute right-6 top-2 border-0 flex flex-y items-center gap-3 mt-2">
        <div>
          <Icon
            className="w-6 h-6 rounded-full"
            name={receiverAssetType?.icon}
          />
        </div>
        <div className="text-black dark:text-white place-self-center">
          {receiverAssetType?.ticker}
        </div>
      </div>
      <BalanceDisplay
        balance={balanceText}
        className="absolute text-white right-0 bottom-3 mr-6 mt-2.5 text-xs"
        loader={shouldShowLoader}
      />
    </div>
  );
};

export default ReceiverBalanceDisplay;
