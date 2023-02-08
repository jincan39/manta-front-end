import { useEffect } from 'react';

import Icon from 'components/Icon';
import { useSBT } from 'pages/SBTPage/SBTContext';
import { useGenerating } from 'pages/SBTPage/SBTContext/generatingContext';
import Progress from '../Progress';
import SignerButton from '../SignerButton';
import WalletButton from '../WalletButton';

const INTERVAL_TIME = 4000;

const UploadedImg = ({
  url,
  index,
  length
}: {
  url: string;
  index: number;
  length: number;
}) => {
  const transformStyle = `scale(${Math.pow(0.9, index)})`;
  const left = `${6 * index}rem`;
  return (
    <img
      src={url}
      className={'w-60 h-60 rounded-lg transform absolute'}
      style={{
        transform: transformStyle,
        left,
        zIndex: length - index,
        opacity: 0.9
      }}
      key={index}
    />
  );
};

const Generating = () => {
  const { imgList } = useSBT();
  const { queryGenerateResult } = useGenerating();

  useEffect(() => {
    const timer = setInterval(() => {
      queryGenerateResult();
    }, INTERVAL_TIME);

    return () => clearInterval(timer);
  }, [queryGenerateResult]);

  return (
    <div className="flex-1 flex flex-col mx-auto mb-32 bg-secondary rounded-xl p-6 w-75 relative mt-6 z-0">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Analyzing...</h1>
      <div className="relative w-full h-60">
        {imgList.map(({ url }, index) => {
          return (
            <UploadedImg
              key={index}
              url={url ?? ''}
              index={index}
              length={imgList.length}
            />
          );
        })}
      </div>
      <p className="text-sm text-opacity-60 text-white my-6">
        It will normally take 20 mins.
      </p>
      <div className="flex border border-dashed w-max p-4">
        <div className="flex flex-col">
          <p className="text-xl">While you are waiting...</p>
          <div className="text-warning border border-warning bg-light-warning rounded-xl px-4 py-1 my-4">
            You will need Manta Signer to mint your SBTs
          </div>
          <p className="text-white text-opacity-60">
            Please start your Manta Signer to connect.
          </p>
          <SignerButton />
          <WalletButton />
          <p className="flex flex-row gap-2 mt-5 text-secondary text-xsss">
            <Icon name="information" />
            Already installed? Try refreshing this page
          </p>
        </div>
        <Progress />
      </div>
    </div>
  );
};

export default Generating;
