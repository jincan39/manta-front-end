import { useEffect, useMemo, useRef } from 'react';

import Icon from 'components/Icon';
import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useFaceRecognition } from 'pages/SBTPage/SBTContext/faceRecognitionContext';
import UploadImg from '../UploadImg';

export const MAX_UPLOAD_LEN = 20;
const MIN_UPLOAD_LEN = 0;

const UploadItem = ({ file, index }: { file: File; index: number }) => {
  const { handleRemove, checkInvalid } = useFaceRecognition();

  const invalid = checkInvalid(index);
  const inValidStyle = invalid ? '' : 'hidden group-hover:block';
  return (
    <div className="relative w-max group" key={index}>
      <img src={URL.createObjectURL(file)} className="rounded-lg w-48 h-48" />
      <Icon
        onClick={() => handleRemove(index)}
        name="close"
        className={`absolute ${inValidStyle} -right-3 -top-3  cursor-pointer`}
      />
      {invalid && (
        <Icon
          name="invalid"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      )}
    </div>
  );
};

const UploadPanel = () => {
  const imgContainer = useRef<HTMLDivElement>(null);

  const { setCurrentStep, imgList } = useSBT();
  const { modelsLoaded, detectFaces, errorMsg, getGender } =
    useFaceRecognition();

  useEffect(() => {
    if (!imgList.length || !imgContainer?.current || !modelsLoaded) {
      return;
    }

    detectFaces(imgContainer);
  }, [detectFaces, imgList, modelsLoaded]);

  const toThemePage = async () => {
    setCurrentStep(Step.Theme);
    getGender();
  };

  const btnDisabled = useMemo(() => {
    return (
      imgList.length < MIN_UPLOAD_LEN ||
      imgList.length > MAX_UPLOAD_LEN ||
      !!errorMsg
    );
  }, [imgList, errorMsg]);

  const disabledStyle = btnDisabled ? 'brightness-50 cursor-not-allowed' : '';

  return (
    <div className="flex-1 flex flex-col mx-auto mb-32 bg-secondary rounded-xl p-6 w-75 relative">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Upload Photos</h1>
      <p className="text-sm text-opacity-60 text-white">
        Please upload at least 5 selfies. Adding more photos will produce a
        better zkSBT. Please make sure the image clearly depicts your face.
        Avoid using any images that have other faces in them. Please also make
        sure the background is clean. This will ensure the best generation of
        your zkSBT.
      </p>
      {errorMsg && (
        <p className="absolute flex top-48 text-error">
          <Icon name="information" className="mr-2" />
          {errorMsg}
        </p>
      )}
      <div
        className="grid w-full gap-6 grid-cols-5 pb-16 pt-4 mt-9 max-h-120 overflow-y-auto"
        ref={imgContainer}>
        {imgList?.map(({ file }, index) => {
          return <UploadItem file={file} index={index} key={index} />;
        })}
        <UploadImg />
      </div>
      <button
        onClick={toThemePage}
        disabled={btnDisabled}
        className={`absolute px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter bottom-4 left-1/2 -translate-x-1/2 transform ${disabledStyle}`}>
        Confirm
      </button>
    </div>
  );
};

export default UploadPanel;
