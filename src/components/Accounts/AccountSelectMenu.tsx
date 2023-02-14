// @ts-nocheck
import classNames from 'classnames';
import { useExternalAccount } from 'contexts/externalAccountContext';
import { useKeyring } from 'contexts/keyringContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useMetamask } from 'contexts/metamaskContext';
import React, { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import Icon from 'components/Icon';
import WalletSelectBar from './WalletSelectIconBar';
import ConnectWallet from './ConnectWallet';
import AccountSelectDropdown from './AccountSelectDropdown';

const DisplayAccountsButton = () => {
  const { txStatus } = useTxStatus();
  const { ethAddress } = useMetamask();
  const disabled = txStatus?.isProcessing();
  const { selectedWallet } = useKeyring();
  const { externalAccount } = useExternalAccount();
  const [showAccountList, setShowAccountList] = useState(false);
  const [isMetamaskSelected, setIsMetamaskSelected] = useState(false);

  const isMetamaskEnabled =
    !!ethAddress && window?.location?.pathname?.includes('dolphin/bridge');

  const succinctAccountName =
    externalAccount?.meta.name.length > 8
      ? `${externalAccount?.meta.name.slice(0, 8)}...`
      : externalAccount?.meta.name;

  const ExternalAccountBlock = ({ text }) => {
    return (
      <>
        <img
          className="w-6 h-6 rounded-full"
          src={selectedWallet.logo.src}
          alt={selectedWallet.logo.alt}
        />
        {isMetamaskEnabled && (
          <Icon className="w-6 h-6 rounded-full" name="metamask" />
        )}
        {text}
      </>
    );
  };

  return (
    <div className="relative">
      <OutsideClickHandler onOutsideClick={() => setShowAccountList(false)}>
        <div
          className={classNames(
            `flex flex-row justify-center h-10 gap-3 border border-white-light bg-fifth dark:text-black dark:text-white font-red-hat-mono text-sm cursor-pointer rounded-lg items-center ${
              isMetamaskEnabled ? 'w-44' : 'w-36'
            }`
          )}
          onClick={() => setShowAccountList(!showAccountList)}>
          <ExternalAccountBlock
            text={isMetamaskEnabled ? 'Connected' : succinctAccountName}
          />
        </div>
        {showAccountList && (
          <div className="w-80 flex flex-col mt-3 absolute right-0 top-full border border-white-light rounded-lg text-black dark:text-white">
            <div className="flex flex-row items-center justify-between bg-fourth rounded-t-lg">
              <div className="flex flex-row items-center">
                <WalletSelectBar
                  isMetamaskSelected={isMetamaskSelected}
                  setIsMetamaskSelected={setIsMetamaskSelected}
                />
              </div>
              <div className="relative top-1">
                <ConnectWallet
                  isButtonShape={false}
                  setIsMetamaskSelected={setIsMetamaskSelected}
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto bg-primary px-5 py-5 rounded-b-lg">
              <AccountSelectDropdown isMetamaskSelected={isMetamaskSelected} />
            </div>
          </div>
        )}
      </OutsideClickHandler>
    </div>
  );
};

const AccountSelectMenu = () => {
  const { externalAccount } = useExternalAccount();

  return externalAccount ? (
    <DisplayAccountsButton />
  ) : (
    <ConnectWallet
      isButtonShape={true}
      className={
        'bg-connect-wallet-button text-white font-red-hat-mono text-sm h-10 w-36 cursor-pointer rounded-lg'
      }
    />
  );
};

export default AccountSelectMenu;
