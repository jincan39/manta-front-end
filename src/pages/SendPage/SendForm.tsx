import React, { useEffect } from 'react';
import { useConfig } from 'contexts/configContext';
import DowntimeModal from 'components/Modal/downtimeModal';
import MobileNotSupportedModal from 'components/Modal/mobileNotSupported';
import userIsMobile from 'utils/ui/userIsMobile';
import { useKeyring } from 'contexts/keyringContext';
import { useTxStatus } from 'contexts/txStatusContext';
import classNames from 'classnames';
import Icon from 'components/Icon';
import SendFromForm from './SendFromForm';
import SendToForm from './SendToForm';
import { useSend } from './SendContext';
import SwitchMantaWalletAndSigner from './SwitchMantaWalletAndSigner';

const SendForm = () => {
  const config = useConfig();
  const { keyring } = useKeyring();
  const {
    swapSenderAndReceiverArePrivate,
    isPrivateTransfer,
    isPublicTransfer
  } = useSend();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const disabledSwapSenderReceiver = isPrivateTransfer() || isPublicTransfer();

  useEffect(() => {
    if (keyring) {
      keyring.setSS58Format(config.SS58_FORMAT);
    }
  }, [keyring]);

  const onClickSwapSenderReceiver = () => {
    if (!disabled) {
      swapSenderAndReceiverArePrivate();
    }
  };

  document.title = config.PAGE_TITLE;

  let warningModal = <div />;
  if (config.DOWNTIME) {
    warningModal = <DowntimeModal />;
  } else if (userIsMobile()) {
    warningModal = <MobileNotSupportedModal />;
  }

  return (
    <div>
      {warningModal}
      <div className="2xl:inset-x-0 justify-center min-h-full flex flex-col gap-6 items-center pb-2 pt-21">
        <div
          className={classNames('w-113.5 px-12 py-6 bg-secondary rounded-xl', {
            disabled: disabled
          })}>
          <SendFromForm />
          <div onClick={onClickSwapSenderReceiver}>
            <Icon
              className={classNames('mx-auto my-4 cursor-pointer', {
                disabled: disabled || disabledSwapSenderReceiver
              })}
              fill={disabledSwapSenderReceiver ? 'grey' : 'white'}
              name="upDownArrow"
            />
          </div>
          <SendToForm />
        </div>
        <SwitchMantaWalletAndSigner />
      </div>
    </div>
  );
};

export default SendForm;
