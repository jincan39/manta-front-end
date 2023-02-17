// @ts-nocheck
import { getWallets } from '@talismn/connect-wallets';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useKeyring } from 'contexts/keyringContext';
import { useMetamask } from 'contexts/metamaskContext';
import { useTxStatus } from 'contexts/txStatusContext';
import {
  setLastAccessedWallet
} from 'utils/persistence/walletStorage';

const SubstrateWallets = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { changeExternalAccountOptions } = useExternalAccount();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const { refreshWalletAccounts, selectedWallet, keyringIsBusy } = useKeyring();
  const enabledWallet = getWallets().filter((wallet) => wallet.extension);
  const onClickWalletIconHandler = (wallet) => async () => {
    if (keyringIsBusy.current === false && !disabled) {
      const { account, pairs } = await refreshWalletAccounts(wallet, true);
      changeExternalAccountOptions(account, pairs);
      setLastAccessedWallet(wallet)
      setIsMetamaskSelected(false);
    }
  };

  return enabledWallet.map((wallet) => (
    <button
      className={classNames('px-5 py-5 rounded-t-lg', {
        'bg-primary':
          wallet.extensionName === selectedWallet.extensionName &&
          !isMetamaskSelected,
        disabled: disabled
      })}
      key={wallet.extensionName}
      onClick={onClickWalletIconHandler(wallet)}>
      <img
        className="w-6 h-6 max-w-6 max-h-6"
        src={wallet.logo.src}
        alt={wallet.logo.alt}
      />
    </button>
  ));
};

const MetamaskWallet = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const onClickMetamaskHandler = () => {
    !disabled && setIsMetamaskSelected(true);
  };
  return (
    <button
      className={classNames('px-5 py-5', {
        'bg-primary': isMetamaskSelected,
        disabled: disabled
      })}
      onClick={onClickMetamaskHandler}>
      <Icon className="w-6 h-6 max-w-6 max-h-6" name="metamask" />
    </button>
  );
};

const WalletSelectIconBar = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { ethAddress } = useMetamask();
  const isBridgePage = window?.location?.pathname?.includes('dolphin/bridge');
  return (
    <>
      <SubstrateWallets
        isMetamaskSelected={isMetamaskSelected}
        setIsMetamaskSelected={setIsMetamaskSelected}
      />
      {isBridgePage && ethAddress && (
        <MetamaskWallet
          isMetamaskSelected={isMetamaskSelected}
          setIsMetamaskSelected={setIsMetamaskSelected}
        />
      )}
    </>
  );
};

export default WalletSelectIconBar;
