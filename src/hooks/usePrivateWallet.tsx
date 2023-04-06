import React from 'react';
import { useMantaSignerWallet } from 'contexts/mantaSignerWalletContext';
import { useMantaWallet } from 'contexts/mantaWalletContext';
import Version from 'types/Version';

export enum WalletModeEnum {
  manta = 'manta',
  signer = 'signer'
}

export type MantaWalletExclusiveProperties = {
  mantaWalletVersion: Version | null;
}

const dummyMantaWalletExclusiveProperties: MantaWalletExclusiveProperties = {
  mantaWalletVersion: null
};

export type MantaSignerExclusiveProperties = {
  setBalancesAreStale: (_: boolean) => void;
  balancesAreStale: boolean;
  balancesAreStaleRef: React.MutableRefObject<boolean>;
  signerVersion: Version | null;
}

const dummyMantaSignerExclusiveProperties: MantaSignerExclusiveProperties = {
  setBalancesAreStale: () => {return;},
  balancesAreStale: false,
  balancesAreStaleRef: {current: false},
  signerVersion: null
};

export type WalletModeType = keyof typeof WalletModeEnum | boolean;

export const usePrivateWallet = (mode?: WalletModeType) => {
  const isManta = mode === true || mode === WalletModeEnum.manta;
  return isManta ?
    {...dummyMantaSignerExclusiveProperties, ...useMantaWallet()}
    : {...dummyMantaWalletExclusiveProperties, ...useMantaSignerWallet()};
};
