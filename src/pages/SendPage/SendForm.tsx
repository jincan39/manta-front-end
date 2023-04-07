// @ts-nocheck
import React, { useEffect } from 'react';
import { useConfig } from 'contexts/configContext';
import DowntimeModal from 'components/Modal/downtimeModal';
import MobileNotSupportedModal from 'components/Modal/mobileNotSupported';
import userIsMobile from 'utils/ui/userIsMobile';
import { useKeyring } from 'contexts/keyringContext';
import { useTxStatus } from 'contexts/txStatusContext';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { useGlobal } from 'contexts/globalContexts';
import SendFromForm from './SendFromForm';
import SendToForm from './SendToForm';
import { useSend } from './SendContext';

const SendForm = () => {
  const config = useConfig();
  const { usingMantaWallet, setUsingMantaWallet } = useGlobal();
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

  const toggleUsingMantaWalletState = () => {
    setUsingMantaWallet(!usingMantaWallet);
  };

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

  const toggleWalletStateText = usingMantaWallet ? 'Manta Signer user? And still want to use it?' : 'Manta Wallet is live! Try MantaPay with Manta Wallet';

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
        <div className="flex flex-col items-center">
          <button onClick={toggleUsingMantaWalletState} className="px-6 rounded-3xl border border-solid border-white h-9 flex items-center cursor-hover text-white text-sm cursor-pointer">
            <span>{ toggleWalletStateText }</span>
            <Icon className="w-4 h-4 ml-2 cursor-pointer" name="activityRightArrow" />
          </button>
          <a className="mt-6 flex items-center mb-6 text-white hover:text-white"
            href="https://forum.manta.network/" // TODO: replace the url
            target="_blank"
            rel="noopener noreferrer">
            <span>Learn how to migrate from Manta Signer to Manta Wallet</span>
            <Icon className="w-4 h-4 ml-2 cursor-pointer" name="activityRightArrow" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SendForm;
