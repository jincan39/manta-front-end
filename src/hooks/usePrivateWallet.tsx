import { useMantaSignerWallet } from 'contexts/mantaSignerWalletContext';
import { useMantaWallet } from 'contexts/mantaWalletContext';

export enum WalletModeEnum {
  manta = 'manta',
  signer = 'signer'
}

export type WalletModeType = keyof typeof WalletModeEnum;

export const usePrivateWallet = (mode?: WalletModeType) => {
  return mode === WalletModeEnum.manta ? useMantaWallet() : useMantaSignerWallet();
};
