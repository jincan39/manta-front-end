import { usePrivateWallet } from 'contexts/privateWalletContext';
import {
  useZkAccountBalances,
  ZkAccountBalance
} from 'contexts/zkAccountBalancesContext';
import PrivateAssetItem from './PrivateAssetItem';

const PrivateAssetTableContent = () => {
  const { balances } = useZkAccountBalances();
  const privateWallet = usePrivateWallet();
  if (balances?.length) {
    return (
      <div className="divide-y divide-dashed divide-manta-gray-secondary">
        {balances.map((balance: ZkAccountBalance) => (
          <PrivateAssetItem balance={balance} key={balance.assetType.assetId} />
        ))}
      </div>
    );
  } else if (privateWallet?.balancesAreStaleRef.current) {
    return <div className="whitespace-nowrap text-center mt-6">Syncing...</div>;
  } else {
    return (
      <div className="whitespace-nowrap text-center mt-6">
        You have no zkAssets yet.
      </div>
    );
  }
};

export default PrivateAssetTableContent;
