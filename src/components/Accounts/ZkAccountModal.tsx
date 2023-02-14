// @ts-nocheck
import React, { useRef } from 'react';
import { Tooltip } from 'element-react';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useZkAccountBalances } from 'contexts/zkAccountBalancesContext';
import { useEllipsis } from 'hooks';
import CopyPasteIcon from 'components/CopyPasteIcon';
import Icon from 'components/Icon';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';

const ZkAddressDisplay = () => {
  const { privateAddress } = usePrivateWallet();
  const privateAddressDisplayString = `zkAddress ${privateAddress.slice(0,6)}..${privateAddress.slice(-4)}`;
  return (
    <div className="border border-white-light bg-white bg-opacity-5 rounded-lg p-2 text-secondary flex items-center justify-center gap-4">
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
    <div className="border border-white-light bg-white bg-opacity-5 rounded-lg p-1 text-secondary flex flex-col justify-center items-center">
      <span className="pt-3 pb-1 text-base text-white">Total Balance</span>
      <div className="text-white pb-3 text-2xl font-bold">{'$0.00'}</div>
    </div>
  );
};

const PrivateTokenBalancesDisplay = () => {
  const { balances } = useZkAccountBalances();
  const privateWallet = usePrivateWallet();

  let contents = null;
  if (balances?.length > 0) {
    contents = balances.map((balance) => (
      <PrivateTokenBalancesDisplayItem balance={balance} key={balance.assetType.assetId} />
    ));
  } else if (privateWallet?.balancesAreStaleRef.current) {
    contents = <div className="whitespace-nowrap text-center">Syncing...</div>;
  } else {
    contents = (
      <div className="whitespace-nowrap text-center">
        You have no zkAssets yet.
      </div>
    );
  }

  return (
    <div className="border border-white-light rounded-lg px-6 py-4 text-secondary overflow-y-auto h-48 bg-white bg-opacity-5">
      {contents}
    </div>
  );
};

const PrivateTokenBalancesDisplayItem = ({ balance }) => {
  const privateBalanceRef = useRef();
  const isEllipsis = useEllipsis(privateBalanceRef);

  const tip = (
    <div className="zkAddressTooltip">
      {balance.privateBalance.toStringUnrounded()}
    </div>
  );

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex gap-3 items-center">
        <div className="flex-shrink-0">
          <Icon
            className="w-8 h-8 rounded-full"
            name={balance.assetType.icon}
          />
        </div>
        <div className="overflow-hidden zkAddressTooltipWrapper">
          <div className="text-white">{balance.assetType.ticker}</div>
          <Tooltip
            visibleArrow={false}
            content={isEllipsis ? tip : null}
            placement="right-end">
            <div
              ref={privateBalanceRef}
              className="text-secondary overflow-hidden overflow-ellipsis">
              {balance.privateBalance.toStringUnrounded()}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="text-white">{'$0.00'}</div>
    </div>
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

const BalancesDisplay = () => {
  return (
    <>
      <UsdBalanceDisplay />
      <PrivateTokenBalancesDisplay />
    </>
  );
};

const ZkAccountModalContent = () => {
  const { apiState } = useSubstrate();
  const isDisconnected =
    apiState === API_STATE.DISCONNECTED || apiState === API_STATE.ERROR;
  return (
    <>
      <div className="flex flex-col gap-4 w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white-light text-secondary">
        <ZkAddressDisplay />
        {isDisconnected ? <NetworkDisconnectedDisplay /> : <BalancesDisplay />}
      </div>
    </>
  );
};

const NoZkAccountModal = () => {
  return (
    <div className="w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white-light text-secondary ">
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
