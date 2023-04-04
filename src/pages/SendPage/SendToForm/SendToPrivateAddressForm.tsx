// @ts-nocheck
import { useGlobal } from 'contexts/globalContexts';
import { usePrivateWallet } from 'hooks';
import SendToAddressForm from './SendToAddressForm';

const INTERNAL_ACCOUNT_LABEL = 'Private';

const toReactSelectOption = (address) => {
  return {
    value: { address },
    label: INTERNAL_ACCOUNT_LABEL
  };
};

const SendToPrivateAddressForm = () => {
  const { usingMantaWallet } = useGlobal();
  const { privateAddress } = usePrivateWallet(usingMantaWallet);
  const options = privateAddress ? [privateAddress] : [];

  return (
    <SendToAddressForm
      options={options}
      toReactSelectOption={toReactSelectOption}
      isPrivate={true}
    />
  );
};

export default SendToPrivateAddressForm;
