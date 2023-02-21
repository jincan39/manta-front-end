import React, { useState } from 'react';
import classNames from 'classnames';
import PrivateActivityTableContent from './PrivateActivityTableContent';
import PrivateAssetTableContent from './PrivateAssetTableContent';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import CopyPasteIcon from 'components/CopyPasteIcon';
import Icon from 'components/Icon';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import getAbbreviatedName from 'utils/display/getAbbreviatedName';

type TableContentSelectorProp = {
  displayAssets: boolean;
  displayAssetsHandler: () => void;
  displayActivityHandler: () => void;
};

const TableContentSelector = ({
  displayAssets,
  displayAssetsHandler,
  displayActivityHandler
}: TableContentSelectorProp) => {
  return (
    <div className="flex items-center text-white-60">
      <div
        className="cursor-pointer w-1/2 text-center text-sm"
        onClick={displayAssetsHandler}>
        <div
          className={classNames('pt-4 pb-3.5', {
            'text-white': displayAssets
          })}>
          Assets
        </div>
        <Icon name={displayAssets ? 'blueSolidLine' : 'grayThinLine'} />
      </div>
      <div
        className="cursor-pointer w-1/2 text-center text-sm"
        onClick={displayActivityHandler}>
        <div
          className={classNames('pt-4 pb-3.5', {
            'text-white': !displayAssets
          })}>
          Activity
        </div>
        <Icon name={displayAssets ? 'grayThinLine' : 'blueSolidLine'} />
      </div>
    </div>
  );
};

const ZkAddressDisplay = () => {
  const { privateAddress } = usePrivateWallet();
  const privateAddressDisplayString = `zkAddress ${getAbbreviatedName(
    privateAddress,
    6,
    4
  )}`;
  return (
    <div className="border border-secondary bg-white bg-opacity-5 rounded-lg p-2 text-secondary flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6" name="manta" />
        <span className="text-white font-light">
          {privateAddressDisplayString}
        </span>
      </div>
      <CopyPasteIcon className="w-5 h-5" textToCopy={privateAddress} />
    </div>
  );
};

const UsdBalanceDisplay = () => {
  return (
    <div className="border border-secondary bg-white bg-opacity-5 rounded-lg p-1 mt-4 text-secondary flex flex-col justify-center items-center">
      <span className="pt-3 pb-1 text-base text-white">Total Balance</span>
      <div className="text-white pb-3 text-2xl font-bold">{'$0.00'}</div>
    </div>
  );
};

const TableContentDisplay = () => {
  const [displayAssets, setDisplayAssets] = useState(true);

  const displayAssetsHandler = () => {
    setDisplayAssets(true);
  };

  const displayActivityHandler = () => {
    setDisplayAssets(false);
  };
  return (
    <>
      <TableContentSelector
        displayAssets={displayAssets}
        displayAssetsHandler={displayAssetsHandler}
        displayActivityHandler={displayActivityHandler}
      />
      <div className="overflow-y-auto h-50">
        {displayAssets ? (
          <PrivateAssetTableContent />
        ) : (
          <PrivateActivityTableContent />
        )}
      </div>
    </>
  );
};

const NetworkDisconnectedDisplay = () => {
  return (
    <div className="border border-secondary rounded-lg px-6 py-6 text-secondary overflow-y-auto bg-white bg-opacity-5">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-white text-center">
          Cannot connect to the network
        </div>
        <div className="text-secondary text-xss">
          Please check your internet connection and wait to reconnect.
        </div>
      </div>
    </div>
  );
};

const ZkAccountModalContent = () => {
  const { apiState } = useSubstrate();
  const isDisconnected =
    apiState === API_STATE.DISCONNECTED || apiState === API_STATE.ERROR;
  return (
    <>
      <div className="flex flex-col w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white border-opacity-20 text-secondary ">
        <ZkAddressDisplay />
        <UsdBalanceDisplay />
        {isDisconnected ? (
          <NetworkDisconnectedDisplay />
        ) : (
          <TableContentDisplay />
        )}
      </div>
    </>
  );
};

const NoZkAccountModal = () => {
  return (
    <div className="w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white border-opacity-20 text-secondary ">
      <div className="whitespace-nowrap text-center">
        You have no zkAccount yet.
      </div>
    </div>
  );
};

const ZkAccountModal = () => {
  const { privateAddress } = usePrivateWallet();
  return privateAddress ? <ZkAccountModalContent /> : <NoZkAccountModal />;
};

export default ZkAccountModal;
