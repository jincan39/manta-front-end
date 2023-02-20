import {
  useZkAccountBalances,
  ZkAccountBalance
} from 'contexts/zkAccountBalancesContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import Icon, { IconName } from 'components/Icon';

type PrivateAssetItemProps = {
  balance: ZkAccountBalance;
};
const PrivateAssetItem = ({ balance }: PrivateAssetItemProps) => {
  return (
    <div className="flex items-center justify-between pl-2.5 pr-3.5 py-2 text-sm hover:bg-thirdry">
      <div className="flex gap-3 items-center">
        <Icon
          className="w-8 h-8 rounded-full"
          name={balance.assetType.icon as IconName}
        />
        <div>
          <div className="text-white">{balance.assetType.ticker}</div>
          <div className="text-secondary">
            {balance.privateBalance.toString()}
          </div>
        </div>
      </div>
      <div className="text-white">{'$0.00'}</div>
    </div>
  );
};

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
