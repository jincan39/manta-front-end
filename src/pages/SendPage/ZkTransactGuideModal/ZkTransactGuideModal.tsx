import { usePublicAccount } from 'contexts/externalAccountContext';
import { useGlobal } from 'contexts/globalContexts';
import { usePrivateWallet } from 'hooks';
import ZkTransactConnectSignerModal from './ZkTransactConnectSignerModal';
import ZkTransactConnectWalletModal from './ZkTransactConnectWalletModal';
import ZkTransactConnectedModal from './ZkTransactConnectedModal';

const ZkTransactGuideModal = () => {
  const { externalAccount } = usePublicAccount();
  const { usingMantaWallet } = useGlobal();
  const { signerIsConnected } = usePrivateWallet(usingMantaWallet);
  return (
    <>
      {!externalAccount && !signerIsConnected && (
        <ZkTransactConnectWalletModal />
      )}
      {externalAccount && !signerIsConnected && (
        <ZkTransactConnectSignerModal />
      )}
      {signerIsConnected && externalAccount && <ZkTransactConnectedModal />}
    </>
  );
};

export default ZkTransactGuideModal;
