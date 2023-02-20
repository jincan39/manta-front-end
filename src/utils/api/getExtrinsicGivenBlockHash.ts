import extrinsicWasSentByUser from './ExtrinsicWasSendByUser';
import { BlockHash } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';
const getExtrinsicGivenBlockHash = async (
  blockHash: BlockHash,
  externalAccount: any,
  api: ApiPromise
) => {
  const signedBlock = await api.rpc.chain.getBlock(blockHash);
  const extrinsics = signedBlock.block.extrinsics;
  const extrinsic = extrinsics.find((extrinsic) =>
    extrinsicWasSentByUser(extrinsic, externalAccount, api)
  );
  return extrinsic;
};

export default getExtrinsicGivenBlockHash;
