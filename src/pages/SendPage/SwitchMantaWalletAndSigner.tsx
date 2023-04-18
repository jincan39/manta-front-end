import WALLET_NAME from 'constants/WalletConstants';
import React from 'react';
import { useKeyring } from 'contexts/keyringContext';
import { useTxStatus } from 'contexts/txStatusContext';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { useGlobal } from 'contexts/globalContexts';
import { getSubstrateWallets } from 'utils';
import {
  getLastAccessedWallet,
  setLastAccessedWallet
} from 'utils/persistence/walletStorage';
import { usePublicAccount } from 'contexts/publicAccountContext';

const SwitchMantaWalletAndSigner = () => {
  const { usingMantaWallet, setUsingMantaWallet } = useGlobal();
  const { refreshWalletAccounts,getLatestAccountAndPairs, keyringIsBusy } = useKeyring();
  const { changeExternalAccountOptions } = usePublicAccount();

  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  const toggleUsingMantaWalletState = async () => {
    if (disabled) {
      return;
    }
    const lastAccessExtensionName = getLastAccessedWallet()?.extensionName;
    if (usingMantaWallet && lastAccessExtensionName === WALLET_NAME.MANTA) {
      const substrateWallets = getSubstrateWallets();
      const enabledExtentions = substrateWallets.filter((wallet) => (wallet.extension && wallet.extensionName !== WALLET_NAME.MANTA));
      if (enabledExtentions.length > 0) {
        // switch to another wallet as the default wallet
        if (keyringIsBusy.current === false) {
          const defaultWallet = enabledExtentions[0];
          await refreshWalletAccounts(defaultWallet);
          const { account, pairs } = getLatestAccountAndPairs();
          changeExternalAccountOptions(account, pairs);
          setLastAccessedWallet(defaultWallet);
        }
      } else {
        // reset state if no wallet exist
        changeExternalAccountOptions(null, []);
        setLastAccessedWallet(null);
      }
    }

    setUsingMantaWallet(!usingMantaWallet);
  };

  const toggleWalletStateText = usingMantaWallet ? 'Manta Signer user? And still want to use it?' : 'Manta Wallet is live! Try MantaPay with Manta Wallet';

  return (
    <div className="flex flex-col items-center">
      <button onClick={toggleUsingMantaWalletState} className={classNames(
        'px-6 rounded-3xl border border-solid border-white h-9 flex',
        'items-center cursor-hover text-white text-sm cursor-pointer',
        {'disabled': disabled }
      )}>
        <span>{ toggleWalletStateText }</span>
        <Icon className="w-4 h-4 ml-2 cursor-pointer" name="activityRightArrow" />
      </button>
      <a className="mt-6 flex items-center mb-6 text-white hover:text-white"
        href="https://docs.manta.network/docs/guides/MantaWalletMigration"
        target="_blank"
        rel="noopener noreferrer">
        <span>Learn how to migrate from Manta Signer to Manta Wallet</span>
        <Icon className="w-4 h-4 ml-2 cursor-pointer" name="activityRightArrow" />
      </a>
    </div>
  );
};

export default SwitchMantaWalletAndSigner;
