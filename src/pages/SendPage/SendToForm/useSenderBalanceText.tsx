import { usePublicAccount } from 'contexts/externalAccountContext';
import { usePrivateWallet } from 'hooks';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { useSend } from 'pages/SendPage/SendContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';

const useSenderBalanceText = () => {
  const { apiState } = useSubstrate();
  const { senderAssetCurrentBalance, senderIsPrivate } = useSend();
  const { externalAccount } = usePublicAccount();
  const { privateAddress } = usePrivateWallet();
  const { isInitialSync } = usePrivateWallet();

  const apiIsDisconnected =
    apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;

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
  const shouldShowLoader = senderIsPrivate()
    ? shouldShowPrivateLoader
    : shouldShowPublicLoader;
  return { balanceText, shouldShowLoader };
};

export default useSenderBalanceText;
