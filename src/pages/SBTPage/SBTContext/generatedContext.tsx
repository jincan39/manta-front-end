import { createContext, ReactNode, useState, useMemo, useContext } from 'react';

type GeneratedContextValue = {
  mintSet: Set<string>;
  setMintSet: (mintSet: Set<string>) => void;
};

const GeneratedContext = createContext<GeneratedContextValue | null>(null);

export const GeneratedContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [mintSet, setMintSet] = useState<Set<string>>(new Set(''));

  const value = useMemo(
    () => ({
      mintSet,
      setMintSet
    }),
    [mintSet]
  );

  return (
    <GeneratedContext.Provider value={value}>
      {children}
    </GeneratedContext.Provider>
  );
};

export const useGenerated = () => {
  const data = useContext(GeneratedContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useGenerated can only be used inside of <GeneratedContext />, please declare it at a higher level.'
    );
  }
  return data;
};
