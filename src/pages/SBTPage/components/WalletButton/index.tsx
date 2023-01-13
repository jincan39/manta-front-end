import { useExternalAccount } from 'contexts/externalAccountContext';
import { useKeyring } from 'contexts/keyringContext';

const WalletButton = () => {
  const { externalAccount } = useExternalAccount();
  const { selectedWallet } = useKeyring();
  const succinctAccountName =
    externalAccount?.meta.name.length > 8
      ? `${externalAccount?.meta.name.slice(0, 8)}...`
      : externalAccount?.meta.name;

  if (externalAccount) {
    return (
      <button className="my-4 border border-dashed py-2 unselectable-text text-center text-white rounded-lg w-64 flex justify-around item-center">
        Singed in as
        <img
          className="w-6 h-6 rounded-full mx-1"
          src={selectedWallet.logo.src}
          alt={selectedWallet.logo.alt}
        />
        {succinctAccountName}
      </button>
    );
  }
  return (
    <button className="bg-connect-wallet-button py-2 unselectable-text text-center text-white rounded-lg w-64">
      Connect Wallet
    </button>
  );
};
export default WalletButton;
