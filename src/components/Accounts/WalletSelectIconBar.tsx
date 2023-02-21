// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import { useMetamask } from 'contexts/metamaskContext';
import { getWallets } from '@talismn/connect-wallets';
import { useKeyring } from 'contexts/keyringContext';
import { useTxStatus } from 'contexts/txStatusContext';
import Icon from 'components/Icon';

const SubstrateWallets = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const { refreshWalletAccounts, selectedWallet, keyringIsBusy } = useKeyring();
  const enabledWallet = getWallets().filter((wallet) => wallet.extension);
  const onClickWalletIconHandler = (wallet) => () => {
    if (keyringIsBusy.current === false && !disabled) {
      refreshWalletAccounts(wallet);
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
