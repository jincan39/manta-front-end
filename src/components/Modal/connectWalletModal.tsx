// @ts-nocheck
import React from 'react';
import Icon from 'components/Icon';
import { useKeyring } from 'contexts/keyringContext';
import { useMetamask } from 'contexts/metamaskContext';
import { getSubstrateWallets } from 'utils';
import getWalletDisplayName from 'utils/display/getWalletDisplayName';
import { useGlobal } from 'contexts/globalContexts';

const WalletNotInstalledBlock = ({
  walletName,
  walletLogo,
  walletInstallLink
}) => {
  return (
    <div className="mt-4 py-3 px-4 h-16 text-sm flex items-center justify-between border border-white-light text-white rounded-lg w-full block">
      <div className="flex flex-row items-center gap-4">
        {walletLogo && typeof walletLogo === 'object' ? (
          <img
            src={walletLogo.src}
            alt={walletLogo.alt}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <Icon name={walletLogo} className="w-6 h-6 rounded-full" />
        )}
        {walletName}
      </div>
      <a href={walletInstallLink} target="_blank" rel="noreferrer">
        <div className="text-center rounded-lg bg-button-fourth text-white py-2 px-4 text-sm w-21">
          Install
        </div>
      </a>
    </div>
  );
};

const WalletInstalledBlock = ({ walletName, walletLogo, connectHandler }) => {
  const { isTalismanExtConfigured } = useKeyring();
  return (
    <button
      onClick={connectHandler}
      className="relative mt-4 py-3 px-4 h-16 flex items-center justify-between border border-white-light text-white rounded-lg w-full block">
      <div className="flex flex-row items-center gap-4">
        {walletLogo && typeof walletLogo === 'object' ? (
          <img
            src={walletLogo.src}
            alt={walletLogo.alt}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <Icon name={walletLogo} className="w-6 h-6 rounded-full" />
        )}
        {walletName}
      </div>
      <div className="rounded-lg bg-button-fourth text-white py-2 px-4 text-xs">
        Connect
      </div>

      {walletName === 'Talisman' && !isTalismanExtConfigured && (
        <p className="absolute left-0 -bottom-5 flex flex-row gap-2 b-0 text-warning text-xsss">
          <Icon name="information" />
          You have no account in Talisman. Please create one first.
        </p>
      )}

    </button>
  );
};

const WalletEnabledBlock = ({ walletName, walletLogo }) => {
  return (
    <div className="mt-4 py-3 px-4 h-16 flex items-center justify-between border border-white-light text-white rounded-lg w-full block">
      <div className="flex flex-row items-center gap-4">
        {walletLogo && typeof walletLogo === 'object' ? (
          <img
            src={walletLogo.src}
            alt={walletLogo.alt}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <Icon name={walletLogo} className="w-6 h-6 rounded-full" />
        )}

        {walletName}
      </div>
      <div className="flex flex-row gap-3 items-center rounded-lg text-xs">
        <div className="rounded full w-2 h-2 bg-green-300"></div>Connected
      </div>
    </div>
  );
};

const ConnectWalletBlock = ({
  walletName,
  isWalletInstalled,
  walletInstallLink,
  walletLogo,
  isWalletEnabled,
  connectHandler
}) => {
  if (isWalletEnabled) {
    return (
      <WalletEnabledBlock walletName={walletName} walletLogo={walletLogo} />
    );
  } else if (isWalletInstalled) {
    return (
      <WalletInstalledBlock
        walletName={walletName}
        walletLogo={walletLogo}
        connectHandler={connectHandler}
      />
    );
  } else {
    return (
      <WalletNotInstalledBlock
        walletName={walletName}
        walletLogo={walletLogo}
        walletInstallLink={walletInstallLink}
      />
    );
  }
};

const MetamaskConnectWalletBlock = ({hideModal}) => {
  const { configureMoonRiver, ethAddress } = useMetamask();
  const metamaskIsInstalled =
    window.ethereum?.isMetaMask &&
    !window.ethereum?.isBraveWallet &&
    !window.ethereum.isTalisman;

  const handleConnectWallet = async () => {
    const isConnected = await configureMoonRiver();
    isConnected && hideModal();
  };

  return (
    <ConnectWalletBlock
      key={'metamask'}
      walletName={'MetaMask (for Moonriver)'}
      isWalletInstalled={metamaskIsInstalled}
      walletInstallLink={'https://metamask.io/'}
      walletLogo="metamask"
      isWalletEnabled={!!ethAddress}
      connectHandler={handleConnectWallet}
    />
  );
};

const MantaConnectWalletBlock = ({ setIsMetamaskSelected, hideModal }) => {
  // TODO
  // get manta wallet meta data
  // { extensionName, installed, installUrl, logo, isWalletEnabled }

  const handleConnectWallet = (walletName) => async () => {
    connectWalletExtension(walletName);
    const isConnected = await connectWallet(walletName);
    if (isConnected) {
      setIsMetamaskSelected && setIsMetamaskSelected(false);
      hideModal();
    }
  };
  return (
    <div className="mt-6 text-white bg-white bg-opacity-5 p-4 rounded-lg">
      <div className="font-semibold text-sm">Recommended Wallet</div>
      <div className="text-sm mt-2">
        Have both public addresses and zkAddress.
        <br />
        You can explore all the products of Manta with it.
      </div>
      <ConnectWalletBlock
        key={'manta'}
        walletName={'Manta Wallet'}
        isWalletInstalled={false}
        walletInstallLink={'dd'}
        walletLogo={'manta'}
        isWalletEnabled={false}
        connectHandler={handleConnectWallet('mantawallet')}
      />
      <div className="mt-4 text-sm">
        <div>Manta Signer user? </div>
        <a className="flex items-center mb-6 text-white hover:text-white" 
          href="https://forum.manta.network/" // TODO: replace the url
          target="_blank"
          rel="noopener noreferrer">
          <span>Learn how to migrate from Manta Signer to Manta Wallet</span>
          <Icon className="w-4 h-4 ml-2 cursor-pointer" name="activityRightArrow" />
        </a>
      </div>
    </div>
  );
};

export const SubstrateConnectWalletBlock = ({ setIsMetamaskSelected, hideModal }) => {
  const { connectWallet, connectWalletExtension } = useKeyring();
  const substrateWallets = getSubstrateWallets();

  const handleConnectWallet = (walletName) => async () => {
    connectWalletExtension(walletName);
    const isConnected = await connectWallet(walletName);
    if (isConnected) {
      setIsMetamaskSelected && setIsMetamaskSelected(false);
      hideModal();
    }
  };

  return substrateWallets.map((wallet) => {
    // wallet.extension would not be defined if enabled not called
    const isWalletEnabled = wallet.extension ? true : false;
    return (
      <ConnectWalletBlock
        key={wallet.extensionName}
        walletName={getWalletDisplayName(wallet.extensionName)}
        isWalletInstalled={wallet.installed}
        walletInstallLink={wallet.installUrl}
        walletLogo={wallet.logo}
        isWalletEnabled={isWalletEnabled}
        connectHandler={handleConnectWallet(wallet.extensionName)}
      />
    );
  });
};

const ConnectWalletModal = ({ setIsMetamaskSelected, hideModal }) => {
  const isBridgePage = window?.location?.pathname?.includes('bridge');
  const { usingMantaWallet } = useGlobal();
  if (usingMantaWallet) {
    return (
      <div className="w-108">
        <h1 className="text-xl text-white">Connect Wallet</h1>
        <MantaConnectWalletBlock 
          setIsMetamaskSelected={setIsMetamaskSelected}
          hideModal={hideModal}
        />
        <div className="mt-4 text-white bg-white bg-opacity-5 p-4 rounded-lg">
          <div className="font-semibold text-sm">Other Wallets</div>
          <div className="text-sm mt-2">Have public addresses only. If you want to privatize your assets, Manta Wallet is still needed.</div>
          <SubstrateConnectWalletBlock
            setIsMetamaskSelected={setIsMetamaskSelected}
            hideModal={hideModal}
          />
          {isBridgePage && <MetamaskConnectWalletBlock hideModal={hideModal} />}
        </div>
        <p className="flex flex-row gap-2 mt-5 text-secondary text-xsss">
          <Icon name="information" />
          Already installed? Try refreshing this page
        </p>
      </div>
    );
  }
  // we will remove manta signer one day, so this return statement will be removed too.
  // here, considering the different UI modal, for the sake of brevity, we just use two returns.
  return (
    <div className="w-96">
      <h1 className="text-xl text-white">Connect Wallet</h1>
      <SubstrateConnectWalletBlock
        setIsMetamaskSelected={setIsMetamaskSelected}
        hideModal={hideModal}
      />
      {isBridgePage && <MetamaskConnectWalletBlock hideModal={hideModal} />}
      <p className="flex flex-row gap-2 mt-5 text-secondary text-xsss">
        <Icon name="information" />
        Already installed? Try refreshing this page
      </p>
    </div>
  );
};

export default ConnectWalletModal;
