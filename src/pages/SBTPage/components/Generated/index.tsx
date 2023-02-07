import Icon from 'components/Icon';
import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import { useMemo } from 'react';
import GeneratedImgs from '../GeneratedImgs';
export const MAX_MINT_SIZE = 8;

const Generated = () => {
  const { setCurrentStep } = useSBT();
  const { mintSet } = useGenerated();

  const btnDisabled = mintSet.size <= 0 || mintSet.size > MAX_MINT_SIZE;

  const toMintPage = () => {
    return setCurrentStep(Step.Mint);
  };

  const tipInfo = useMemo(() => {
    if (mintSet.size === 1) {
      return '1 Free zkSBT selected';
    }
    return `1 Free + ${mintSet.size - 1} ${
      mintSet.size - 1 > 1 ? 'zkSBTs' : 'zkSBT'
    } selected`;
  }, [mintSet.size]);

  return (
    <div className="relative flex-1 flex flex-col mx-auto mb-10 bg-secondary rounded-xl p-6 w-75 relative mt-6 z-0">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Generated</h1>
      <p className="text-sm text-opacity-60 text-white mb-6">
        Your AI-generated zkSBT results are unique; the same image will never be
        generated again. You can select up to 8 images to mint as your zkSBTs.
      </p>
      <GeneratedImgs />
      <div
        className={
          'absolute unselectable-text text-center text-white rounded-lg bottom-8 left-1/2 -translate-x-1/2 transform'
        }>
        {mintSet.size > 0 ? (
          <span className="flex justify-center items-center text-xs text-white text-opacity-60 mb-3">
            <Icon name="information" className="mr-2" />
            {tipInfo}
          </span>
        ) : null}

        <button
          onClick={toMintPage}
          className={`px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter ${
            btnDisabled ? 'brightness-50 cursor-not-allowed' : ''
          }`}>
          Continue to Mint({mintSet.size})
        </button>
      </div>
    </div>
  );
};

export default Generated;
