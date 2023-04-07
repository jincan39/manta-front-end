import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';
import { useSend } from '../SendContext';

const useReceiverBalanceText = () => {
  const {
    receiverCurrentBalance,
    receiverAddress,
    receiverIsPrivate,
    isToPrivate,
    isToPublic
  } = useSend();
  const { isInitialSync } = usePrivateWallet();
  const { apiState } = useSubstrate();

  const apiIsDisconnected =
    apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;

  const balanceText = getZkTransactBalanceText(
    receiverCurrentBalance,
    apiIsDisconnected,
    receiverIsPrivate(),
    isInitialSync.current
  );

  const shouldShowLoader =
    receiverAddress &&
    !receiverCurrentBalance &&
    !balanceText &&
    (isToPrivate() || isToPublic());

  return { balanceText, shouldShowLoader };
};

export default useReceiverBalanceText;
