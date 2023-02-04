import { useEffect, useState } from 'react';

import DotLoader from 'components/Loaders/DotLoader';
import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useSBTPrivateWallet } from 'pages/SBTPage/SBTContext/sbtPrivateWalletContext';
import { useConfig } from 'contexts/configContext';
import AssetType from 'types/AssetType';
import { useTxStatus } from 'contexts/txStatusContext';
import TxStatus from 'types/TxStatus';
import { useSBTTheme } from 'pages/SBTPage/SBTContext/sbtThemeContext';
import Balance from 'types/Balance';
import BN from 'bn.js';

const ThemeCheckModal = ({ hideModal }: { hideModal: () => void }) => {
  const [loading, toggleLoading] = useState(false);

  const { setCurrentStep, nativeTokenBalance } = useSBT();
  const { checkedThemeItems, generateImgs } = useSBTTheme();
  const { reserveSBT, getReserveGasFee, reserveGasFee } = useSBTPrivateWallet();
  const config = useConfig();
  const { txStatus }: { txStatus: TxStatus | null } = useTxStatus();

  const nativeAsset = AssetType.Native(config);

  const PRE_SBT_PRICE = new Balance(nativeAsset, new BN(178400000000000));

  const toGeneratingPage = async () => {
    if (loading) {
      return;
    }
    toggleLoading(true);
    try {
      await reserveSBT();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getReserveGasFee();
  }, [getReserveGasFee]);

  useEffect(() => {
    const handleTxFinalized = async () => {
      if (txStatus?.isFinalized()) {
        await generateImgs();
        toggleLoading(false);
        hideModal();
        setTimeout(() => {
          setCurrentStep(Step.Generating);
        }, 100);
      }
    };

    handleTxFinalized();
  }, [txStatus, hideModal, setCurrentStep, generateImgs]);

  const totalValue = reserveGasFee?.add(PRE_SBT_PRICE);

  const loadingStyle = loading ? 'brightness-50 cursor-not-allowed' : '';
  const disabled =
    loading ||
    totalValue?.gt(nativeTokenBalance ?? new Balance(nativeAsset, new BN(0)));

  const disabledStyle = disabled ? 'brightness-50 cursor-not-allowed' : '';

  return (
    <div className="text-white w-128 text-center">
      <h2 className="text-2xl">Checkout</h2>
      <div className="bg-secondary rounded-lg mt-6 mb-4">
        <div className="flex justify-between p-4">
          <p>{checkedThemeItems.size} Avatars + ONE Free Mint zkSBT PLAN</p>
          <div className="flex flex-col">
            <span className="text-check">
              {PRE_SBT_PRICE.toDisplayString()}
            </span>
            <span className="text-white text-opacity-60">$0 USD</span>
          </div>
        </div>
        <div className="flex justify-between border-b border-split p-4">
          <p>Gas Fee</p>
          <span className="ml-auto text-opacity-60 text-white mr-2">
            + approximately
          </span>
          <span className="text-white">
            {reserveGasFee?.toFeeDisplayString()}
          </span>
        </div>
        <div className="flex justify-between p-4">
          <p>Total</p>
          <div className="flex flex-col">
            <span className="text-check">{totalValue?.toDisplayString()}</span>
            <span className="text-white text-opacity-60">$0 USD</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-left">
        {nativeTokenBalance?.toDisplayString() ?? '-'}
      </p>
      <button
        onClick={toGeneratingPage}
        disabled={disabled}
        className={`px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter mt-6 ${loadingStyle} ${disabledStyle}`}>
        Confirm
        {loading && <DotLoader />}
      </button>
    </div>
  );
};

export default ThemeCheckModal;
