import React, { createContext, useContext } from 'react';
import { useMantaSignerWallet } from 'contexts/mantaSignerWalletContext';
import { useMantaWallet } from 'contexts/mantaWalletContext';
import Version from 'types/Version';
import { useGlobal } from './globalContexts';

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

const PrivateWalletContext = createContext();

export const PrivateWalletContextProvider = ({children}) => {
  const { usingMantaWallet } = useGlobal();
  const value = usingMantaWallet ?
    {...dummyMantaSignerExclusiveProperties, ...useMantaWallet()}
    : {...dummyMantaWalletExclusiveProperties, ...useMantaSignerWallet()};

  return (
    <PrivateWalletContext.Provider value={value}>
      {children}
    </PrivateWalletContext.Provider>
  );
};

export const usePrivateWallet = () => {
  const data = useContext(PrivateWalletContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'usePrivateWallet can only be used inside of <PrivateWalletContext />, please declare it at a higher level.'
    );
  }
  return data;
};
