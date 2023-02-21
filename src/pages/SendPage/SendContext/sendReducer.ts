// @ts-nocheck
import { localStorageKeys } from 'constants/LocalStorageConstants';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import SEND_ACTIONS from './sendActions';
import { getFromLocalStorage, setLocalStorage } from 'utils/persistence/storage';


const getInitialToken = (config, isPrivate) => {
  const localCurrentToken = getFromLocalStorage(localStorageKeys.CurrentToken);
  return AssetType.AllCurrencies(config, isPrivate).find(currency => currency.baseTicker === localCurrentToken) ?? AssetType.AllCurrencies(config, isPrivate)[0];
};


export const buildInitState = (config) => {
  const initSenderAssetType = getInitialToken(
    config,
    getFromLocalStorage(localStorageKeys.IsPrivateSender) === undefined
      ? false
      : getFromLocalStorage(localStorageKeys.IsPrivateSender)
  );
  const initSenderAssetTypeOptions = AssetType.AllCurrencies(
    config,
    getFromLocalStorage(localStorageKeys.IsPrivateSender) === undefined
      ? false
      : getFromLocalStorage(localStorageKeys.IsPrivateSender)
  );
  const initReceiverAssetType = getInitialToken(
    config,
    getFromLocalStorage(localStorageKeys.IsPrivateReceiver) === undefined
      ? true
      : getFromLocalStorage(localStorageKeys.IsPrivateReceiver)
  );
  return {
    config,
    senderPublicAccount: null,

    senderAssetType: initSenderAssetType,
    senderAssetTypeOptions: initSenderAssetTypeOptions,
    senderAssetCurrentBalance: null,
    senderAssetTargetBalance: null,
    senderNativeTokenPublicBalance: null,

    receiverAssetType:initReceiverAssetType,
    receiverCurrentBalance: null,
    receiverAddress: null,
  };
};

const sendReducer = (state, action) => {
  switch (action.type) {
  case SEND_ACTIONS.TOGGLE_SENDER_ACCOUNT_IS_PRIVATE:
    return toggleSenderIsPrivate(state);

  case SEND_ACTIONS.TOGGLE_RECEIVER_ACCOUNT_IS_PRIVATE:
    return toggleReceiverIsPrivate(state);

  case SEND_ACTIONS.SWAP_SENDER_AND_RECEIVER_ACCOUNTS_ARE_PRIVATE:
    return swapSenderAndReceiverAccountsArePrivate(state);

  case SEND_ACTIONS.SET_SELECTED_ASSET_TYPE:
    return setSelectedAssetType(state, action);

  case SEND_ACTIONS.SET_SENDER_PRIVATE_ADDRESS:
    return setSenderPrivateAddress(state, action);

  case SEND_ACTIONS.SET_SENDER_PUBLIC_ACCOUNT:
    return setSenderPublicAccount(state, action);

  case SEND_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE:
    return setSenderAssetCurrentBalance(state, action);

  case SEND_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE:
    return setSenderAssetTargetBalance(state, action);

  case SEND_ACTIONS.SET_SENDER_NATIVE_TOKEN_PUBLIC_BALANCE:
    return setSenderNativeTokenPublicBalance(state, action);

  case SEND_ACTIONS.SET_RECEIVER:
    return setReceiver(state, action);

  case SEND_ACTIONS.SET_RECEIVER_CURRENT_BALANCE:
    return setReceiverCurrentBalance(state, action);

  default:
    throw new Error(`Unknown type: ${action.type}`);
  }
};

const getDefaultReceiver = (
  senderPrivateAddress, senderPublicAccount, senderIsPrivate, receiverIsPrivate) => {
  if (
    senderIsPrivate === receiverIsPrivate ||
    senderIsPrivate === null ||
    receiverIsPrivate === null
  ) {
    return null;
  } else if (!senderIsPrivate && receiverIsPrivate) {
    return senderPrivateAddress;
  } else {
    return senderPublicAccount?.address;
  }
};

const balanceUpdateIsStale = (stateAssetType, updateAssetType) => {
  if (!updateAssetType) {
    return false;
  }
  if (stateAssetType.assetId === updateAssetType.assetId
    && stateAssetType.isPrivate === updateAssetType.isPrivate
  ) {
    return false;
  }
  return true;
};


const toggleSenderIsPrivate = (state) => {
  const senderAssetType = state.senderAssetType.toggleIsPrivate();
  const senderAssetTypeOptions = AssetType.AllCurrencies(state.config, senderAssetType.isPrivate);
  const receiverAddress = getDefaultReceiver(
    state.senderPrivateAddress,
    state.senderPublicAccount,
    senderAssetType.isPrivate,
    state.receiverAssetType.isPrivate
  );

  setLocalStorage(localStorageKeys.IsPrivateSender, senderAssetType.isPrivate);
  setLocalStorage(localStorageKeys.CurrentToken, senderAssetType.baseTicker);

  return {
    ...state,
    senderAssetTypeOptions,
    senderAssetType,
    receiverAddress,
    senderAssetCurrentBalance: null,
  };
};

const toggleReceiverIsPrivate = (state) => {
  const receiverAssetType = state.receiverAssetType.toggleIsPrivate();
  const receiverAddress = getDefaultReceiver(
    state.senderPrivateAddress,
    state.senderPublicAccount,
    state.senderAssetType.isPrivate,
    receiverAssetType.isPrivate
  );

  setLocalStorage(localStorageKeys.IsPrivateReceiver, receiverAssetType.isPrivate);
  setLocalStorage(localStorageKeys.CurrentToken, receiverAssetType.baseTicker);

  return {
    ...state,
    receiverAssetType,
    receiverAddress,
    receiverCurrentBalance: null
  };
};

const swapSenderAndReceiverAccountsArePrivate = (state) => {
  if (state.senderAssetType?.isPrivate !== state.receiverAssetType?.isPrivate) {
    const intermediateState = toggleSenderIsPrivate(state);
    return toggleReceiverIsPrivate(intermediateState);
  }
  return state;
};

const setSelectedAssetType = (state, action) => {
  setLocalStorage(localStorageKeys.CurrentToken, action.selectedAssetType.baseTicker);
  const senderAssetType = action.selectedAssetType;
  let receiverAssetType = senderAssetType;
  if (state.senderAssetType?.isPrivate !== state.receiverAssetType?.isPrivate) {
    receiverAssetType = senderAssetType.toggleIsPrivate();
  }
  let senderAssetTargetBalance = null;
  if (state.senderAssetTargetBalance) {
    senderAssetTargetBalance = Balance.fromBaseUnits(
      senderAssetType, state.senderAssetTargetBalance.valueBaseUnits()
    );
  }

  return {
    ...state,
    senderAssetCurrentBalance: null,
    receiverCurrentBalance: null,
    senderAssetTargetBalance,
    senderAssetType,
    receiverAssetType
  };
};

const setSenderPrivateAddress = (state, action) => {
  if (!state.senderAssetType || !state.receiverAssetType) {
    return {
      ...state,
      senderPrivateAddress: action.senderPrivateAddress
    };
  }
  const receiverAddress = getDefaultReceiver(
    state.senderPrivateAddress,
    state.senderPublicAccount,
    state.senderAssetType?.isPrivate,
    state.receiverAssetType?.isPrivate
  );

  return {
    ...state,
    receiverAddress,
    senderPrivateAddress: action.senderPrivateAddress
  };
};

const setSenderPublicAccount = (state, action) => {
  const defaultReceiver = getDefaultReceiver(
    state.senderPrivateAddress,
    action.senderPublicAccount,
    state.senderAssetType?.isPrivate,
    state.receiverAssetType?.isPrivate
  );

  const receiverAddress = defaultReceiver || state.receiverAddress;

  return {
    ...state,
    senderAssetCurrentBalance: null,
    senderPublicAccount: action.senderPublicAccount,
    receiverAddress
  };
};

const setSenderAssetCurrentBalance = (state, action) => {
  if (balanceUpdateIsStale(state?.senderAssetType, action.senderAssetCurrentBalance?.assetType)) {
    return state;
  }
  return {
    ...state,
    senderAssetCurrentBalance: action.senderAssetCurrentBalance
  };
};

const setSenderAssetTargetBalance = (state, action) => {
  return {
    ...state,
    senderAssetTargetBalance: action.senderAssetTargetBalance
  };
};

const setSenderNativeTokenPublicBalance = (state, action) => {
  return {
    ...state,
    senderNativeTokenPublicBalance: action.senderNativeTokenPublicBalance
  };
};

const setReceiver  = (state, action) => {
  return {
    ...state,
    receiverAddress: action.receiverAddress
  };
};

const setReceiverCurrentBalance = (state, action) => {
  if (balanceUpdateIsStale(state?.receiverAssetType, action.receiverCurrentBalance?.assetType)) {
    return state;
  }
  return {
    ...state,
    receiverCurrentBalance: action.receiverCurrentBalance
  };
};

export default sendReducer;
