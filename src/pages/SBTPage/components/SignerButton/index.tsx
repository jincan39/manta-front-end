import Icon from 'components/Icon';
import {
  ZkAccountConnect,
  ZkAccountWarning
} from 'components/Navbar/ZkAccountButton';
import { useConfig } from 'contexts/configContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import signerIsOutOfDate from 'utils/validation/signerIsOutOfDate';

const SignerButton = () => {
  const { privateAddress, signerVersion } = usePrivateWallet();
  const config = useConfig();

  if (!privateAddress) {
    return (
      <ZkAccountConnect
        className={
          'my-4 bg-connect-signer-button py-2 unselectable-text text-center text-white rounded-lg w-64'
        }></ZkAccountConnect>
    );
  }

  if (signerIsOutOfDate(config, signerVersion)) {
    return (
      <ZkAccountWarning
        title={'Manta Signer Out of Date'}
        text={
          'Your Manta Signer install is out of date. Please install the latest version to view your zkAddress and zkAssets.'
        }
        showWarningIcon={true}
        showInstallButton={true}
      />
    );
  }

  return (
    <button className="my-4 border border-dashed py-2 unselectable-text text-center text-white rounded-lg w-64 flex justify-around">
      Singer Connected
      <Icon name="greenCheck" />
    </button>
  );
};

export default SignerButton;
