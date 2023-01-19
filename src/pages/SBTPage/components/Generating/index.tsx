import { useSBT } from 'pages/SBTPage/SBTContext';
import MantaIcon from 'resources/images/manta.png';
import Progress from '../Progress';
import SignerButton from '../SignerButton';
import WalletButton from '../WalletButton';
const Generating = () => {
  const { imgList } = useSBT();

  return (
    <div className="flex-1 flex flex-col mx-auto mb-32 bg-secondary rounded-xl p-6 w-75 relative mt-6 z-0">
      <div className="flex items-center">
        <img src={MantaIcon} className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Analyzing...</h1>
      <div className="relative w-full h-60">
        {imgList.map(({ file }, index) => {
          return (
            <img
              src={URL.createObjectURL(file)}
              className={'w-60 h-60 rounded-lg transform absolute'}
              style={{
                transform: `scale(${Math.pow(0.9, index)})`,
                left: `${6 * index}rem`,
                zIndex: imgList.length - index,
                opacity: 0.9
              }}
              key={index}
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.99992 0.333008C5.68138 0.333008 4.39245 0.724001 3.29612 1.45654C2.19979 2.18909 1.34531 3.23028 0.840725 4.44845C0.336141 5.66663 0.204118 7.00707 0.461353 8.30028C0.718588 9.59348 1.35353 10.7814 2.28588 11.7137C3.21823 12.6461 4.40611 13.281 5.69932 13.5382C6.99253 13.7955 8.33297 13.6635 9.55115 13.1589C10.7693 12.6543 11.8105 11.7998 12.5431 10.7035C13.2756 9.60715 13.6666 8.31822 13.6666 6.99967C13.6666 6.1242 13.4942 5.25729 13.1591 4.44845C12.8241 3.63961 12.333 2.90469 11.714 2.28563C11.0949 1.66657 10.36 1.17551 9.55115 0.840478C8.74231 0.505446 7.8754 0.333008 6.99992 0.333008ZM7.66659 9.66634C7.66659 9.84315 7.59635 10.0127 7.47133 10.1377C7.3463 10.2628 7.17673 10.333 6.99992 10.333C6.82311 10.333 6.65354 10.2628 6.52852 10.1377C6.40349 10.0127 6.33326 9.84315 6.33326 9.66634V6.33301C6.33326 6.1562 6.40349 5.98663 6.52852 5.8616C6.65354 5.73658 6.82311 5.66634 6.99992 5.66634C7.17673 5.66634 7.3463 5.73658 7.47133 5.8616C7.59635 5.98663 7.66659 6.1562 7.66659 6.33301V9.66634ZM6.99992 4.99967C6.86807 4.99967 6.73917 4.96058 6.62954 4.88732C6.51991 4.81407 6.43446 4.70995 6.384 4.58813C6.33354 4.46631 6.32034 4.33227 6.34607 4.20295C6.37179 4.07363 6.43528 3.95484 6.52852 3.8616C6.62175 3.76837 6.74054 3.70487 6.86986 3.67915C6.99918 3.65343 7.13323 3.66663 7.25504 3.71709C7.37686 3.76755 7.48098 3.853 7.55423 3.96263C7.62749 4.07226 7.66659 4.20115 7.66659 4.33301C7.66659 4.50982 7.59635 4.67939 7.47133 4.80441C7.3463 4.92944 7.17673 4.99967 6.99992 4.99967Z"
                fill="white"
                fillOpacity="0.7"
              />
            </svg>
            Already installed? Try refreshing this page
          </p>
        </div>
        <Progress />
      </div>
    </div>
  );
};

export default Generating;
