// @ts-nocheck
import { useKeyring } from 'contexts/keyringContext';
import Icon from 'components/Icon';

const ConnectedWalletSignerBlock = () => {
  const { selectedWallet } = useKeyring();
  return (
    <div className="mt-6 py-3 px-4 h-16 flex items-center justify-between border border-white-light text-white rounded-lg w-full block">
      <div className="flex flex-row items-center gap-4">
        <img
          src={selectedWallet?.logo.src}
          alt={selectedWallet?.logo.alt}
          className="w-6 h-6 rounded-full"
        />
        <Icon name="manta" className="w-6 h-6 rounded-full" />
      </div>
      <div className="flex flex-row gap-3 items-center rounded-lg text-xs">
        <div className="rounded full w-2 h-2 bg-green-300"></div>Connected
      </div>
    </div>
  );
};

const ZkTransactConnectedModal = () => {
  return (
    <div className="flex flex-col text-white w-128">
      <h1 className="text-2xl font-bold">Start to zkTransact</h1>
      <div className="py-2 font-medium text-xl">Connect Wallet</div>
      <p className="text-sm text-white text-opacity-70">
        Your wallet and Manta Signer are now connected.
      </p>
      <p className="text-sm text-white text-opacity-70">
        You can start to transact now.
      </p>
      <div className="w-2/3 mb-14">
        <ConnectedWalletSignerBlock />
      </div>
      <div className="absolute bottom-4 left-6 flex flex-row gap-2">
        <div className="h-2 w-12 bg-connect-signer-button rounded"></div>
        <div className="h-2 w-12 bg-connect-signer-button rounded"></div>
        <div className="h-2 w-12 bg-connect-signer-button rounded"></div>
      </div>
    </div>
  );
};

export default ZkTransactConnectedModal;
