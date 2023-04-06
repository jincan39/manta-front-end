// @ts-nocheck
import Version from 'types/Version';

const mantaWalletIsOutOfDate = (config, mantaWalletVersion) => {
  const minRequiredSignerVersion = new Version(config.MIN_REQUIRED_MANTA_WALLET_VERSION);
  return mantaWalletVersion && !mantaWalletVersion.gte(minRequiredSignerVersion);
};

export default signerIsOutOfDate;
