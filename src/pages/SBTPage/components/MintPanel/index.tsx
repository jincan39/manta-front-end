// @ts-nocheck
import { useState } from 'react';
import { Popover } from 'element-react';

import Icon from 'components/Icon';
import { useModal } from 'hooks';
import { useGenerated } from 'pages/SBTPage/SBTContext/generatedContext';
import MintCheckModal from '../MintCheckModal';
import MintedModal from '../MintedModal';

const MintPanel = () => {
  const [showWatermark, toggleWatermark] = useState(true);

  const { mintSet } = useGenerated();
  const { ModalWrapper, showModal, hideModal } = useModal();
  const { ModalWrapper: MintedModalWrapper, showModal: showMintedModal } =
    useModal();

  const firstMinted = [...mintSet]?.[0]?.url;

  const checkedStyle = showWatermark ? 'bg-light-check border-check' : '';

  return (
    <div className="relative flex-1 flex flex-col mx-auto mb-20 bg-secondary rounded-xl p-6 w-75 relative mt-6 z-0">
      <div className="flex items-center">
        <Icon name="manta" className="w-8 h-8 mr-3" />
        <h2 className="text-2xl">zkSBT</h2>
      </div>
      <h1 className="text-3xl my-6">Mint Your zkSBT</h1>
      <div className="flex ml-6">
        <div className="relative">
          <img src={firstMinted} className="w-80 h-70 rounded-3xl" />
          {showWatermark && (
            <Icon
              name="masterManta"
              className="absolute bottom-0 left-0 top-0 right-0 opacity-90"
            />
          )}
        </div>
        <div className="flex flex-col flex-1">
          <div className="bg-secondary rounded-lg  ml-6 pb-4">
            <div className="text-white text-opacity-60 border-b border-split p-4 flex ">
              <Popover
                trigger="hover"
                placement="right"
                content={'Need to Update!'}
                className="unselectable-text">
                <div className="flex items-center">
                  <span>Advanced Crypto Watermark</span>
                  <Icon name="question" className="ml-4 cursor-pointer" />
                </div>
              </Popover>
            </div>
            <span
              onClick={() => toggleWatermark(!showWatermark)}
              className={`ml-4 mt-4 unselectable-text flex justify-between border-2 border-white rounded-2xl cursor-pointer w-32 px-3 py-1 ${checkedStyle}`}>
              <Icon name="manta" className="w-6 h-6 rounded-full" />
              MANTA
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={showModal}
        className="absolute px-36 py-2 unselectable-text text-center text-white rounded-lg gradient-button filter bottom-8 left-1/2 -translate-x-1/2 transform ">
        Mint
      </button>
      <ModalWrapper>
        <MintCheckModal
          hideModal={hideModal}
          showMintedModal={showMintedModal}
        />
      </ModalWrapper>
      <MintedModalWrapper>
        <MintedModal />
      </MintedModalWrapper>
    </div>
  );
};

export default MintPanel;
