// @ts-nocheck
import React from 'react';
import BridgeBalanceInput from 'pages/BridgePage/BridgeBalanceInput';
import AssetTypeSelect from 'components/Assets/AssetTypeSelect';
import { useBridgeData } from './BridgeContext/BridgeDataContext';

const BridgeAssetSelect = () => {
  const {
    senderAssetType,
    senderAssetTypeOptions,
    setSelectedAssetType,
  } = useBridgeData();

  return (
    <div className="w-100 relative">
      <AssetTypeSelect
        assetType={senderAssetType}
        assetTypeOptions={senderAssetTypeOptions}
        setSelectedAssetType={setSelectedAssetType}
      />
      <BridgeBalanceInput />
    </div>
  );
};

export default BridgeAssetSelect;
