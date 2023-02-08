import CopyPasteIcon from 'components/CopyPasteIcon';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';

const MintedModal = () => {
  const { mintSet } = useGenerated();
  const copyAll = () => {
    const textToCopy = [...mintSet].map(({ proofId }) => proofId).join(',');
    navigator.clipboard.writeText(textToCopy);
  };
  return (
    <div className="text-white w-max">
      <h2 className="text-2xl">MINTED！</h2>
      <p className="text-white text-opactity-60 text-xs mb-2">
        Your zkSBTs should appear in your Manta Signer. You can start using{' '}
        <span className="text-check">AsMatch</span> Match2Earn (Click to
        Download) using your newly minted
        <br /> zkSBTs. Begin by copying your zkSBT ID or by copying all zkSBT
        IDs.
      </p>
      <div className="grid w-full gap-6 grid-cols-5 pb-12 mt-6">
        {[...mintSet]?.map(({ blur_url, style, proofId }, index) => {
          return (
            <div className="relative w-max group" key={index}>
              <img src={blur_url} className="rounded-lg w-48 h-48" />
              <span className="text-white absolute bottom-16 left-2">
                {style}
              </span>
              <div className="bg-primary px-4 py-2 flex items-center mt-6 w-48 justify-between text-xs rounded-lg">
                <p className="text-white text-opacity-60">SBT ID</p>
                <p className="text-white">{`${proofId?.slice(
                  0,
                  6
                )}..${proofId?.slice(-4)}`}</p>
                <CopyPasteIcon textToCopy={proofId ?? ''} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center">
        <button
          className="w-56 px-4 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter"
          onClick={copyAll}>
          Click to copy all SBT IDs
        </button>
      </div>
    </div>
  );
};

export default MintedModal;
