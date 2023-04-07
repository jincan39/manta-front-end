import { usePublicAccount } from 'contexts/publicAccountContext';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useSend } from 'pages/SendPage/SendContext';
import getZkTransactBalanceText from 'utils/display/getZkTransactBalanceText';

const useSenderBalanceText = () => {
  const { apiState } = useSubstrate();
  const { senderAssetCurrentBalance, senderIsPrivate } = useSend();
  const { externalAccount } = usePublicAccount();
  const { privateAddress, isInitialSync } = usePrivateWallet();

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
