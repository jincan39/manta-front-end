import { useMantaSignerWallet } from 'contexts/mantaSignerWalletContext';
import { useMantaWallet } from 'contexts/mantaWalletContext';

export enum WalletModeEnum {
  manta = 'manta',
  signer = 'signer'
}

export type WalletModeType = keyof typeof WalletModeEnum | boolean;

export const usePrivateWallet = (mode?: WalletModeType) => {
  const isManta = mode === true || mode === WalletModeEnum.manta;
  return isManta ? useMantaWallet() : useMantaSignerWallet();
};
