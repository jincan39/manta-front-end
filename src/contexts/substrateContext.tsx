// @ts-nocheck
import React, { useReducer, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import TxStatus from 'types/TxStatus';
import types from '../config/types.json';
import { useConfig } from './configContext';
import { useTxStatus } from './txStatusContext';

export enum API_STATE {
  CONNECT_INIT,
  READY,
  ERROR,
  DISCONNECTED
}

const INIT_STATE = {
  socket: null,
  rpc: null,
  types: types,
  api: null,
  apiError: null,
  apiState: null,
  blockNumber: 0
};

const SUBSTRATE_ACTIONS = {
  CONNECT_INIT: 'CONNECT_INIT',
  CONNECT_SUCCESS: 'CONNECT_SUCCESS',
  CONNECT_ERROR: 'CONNECT_ERROR',
  DISCONNECTED: 'DISCONNECTED',
  UPDATE_BLOCK: 'UPDATE_BLOCK'
};

const reducer = (state, action) => {
  switch (action.type) {
  case SUBSTRATE_ACTIONS.CONNECT_INIT:
    return { ...state, apiState: API_STATE.CONNECT_INIT };

  case SUBSTRATE_ACTIONS.CONNECT_SUCCESS:
    return { ...state, api: action.payload, apiState: API_STATE.READY };

  case SUBSTRATE_ACTIONS.CONNECT_ERROR:
    return { ...state, apiState: API_STATE.ERROR, apiError: action.payload };

  case SUBSTRATE_ACTIONS.DISCONNECTED:
    return { ...state, apiState: API_STATE.DISCONNECTED };

  case SUBSTRATE_ACTIONS.UPDATE_BLOCK:
    return { ...state, blockNumber: action.payload };

  default:
    throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node


const SubstrateContext = React.createContext();

const SubstrateContextProvider = ({children}) => {
  const { txStatusRef, setTxStatus } = useTxStatus();
  const config = useConfig();
  const initState = {
    ...INIT_STATE,
    socket: config.PROVIDER_SOCKET,
    rpc: config.RPC
  };
  const [state, dispatch] = useReducer(reducer, initState);
  const { socket, types, rpc } = state;

  useEffect(() => {
    const handleConnected = (api) => {
      console.log('polkadot.js api connected');
      // `ready` event is not emitted upon reconnection and is checked explicitly here.
      api.isReady.then(async () => {
        dispatch({ type: SUBSTRATE_ACTIONS.CONNECT_SUCCESS, payload: api });
        await api.rpc.chain.subscribeNewHeads((header) => {
          dispatch({ type: SUBSTRATE_ACTIONS.UPDATE_BLOCK, payload: header.number.toHuman() });
        });
      });
    };

    const handleError = (err) => {
      console.error(err);
      dispatch({ type: SUBSTRATE_ACTIONS.CONNECT_ERROR, payload: err });
      if (txStatusRef.current?.isProcessing()) {
        setTxStatus(TxStatus.disconnected());
      }
    };

    const handleDisconnected = (provider) => {
      dispatch({ type: SUBSTRATE_ACTIONS.DISCONNECTED, payload: provider });
      if (txStatusRef.current?.isProcessing()) {
        setTxStatus(TxStatus.disconnected());
      }
    };

    const connect = async () => {
      dispatch({ type: SUBSTRATE_ACTIONS.CONNECT_INIT });
      const provider = new WsProvider(socket);
      const api = new ApiPromise({
        provider,
        types,
        rpc
      });
      // Set listeners for disconnection and reconnection event.
      api.on('connected', () => handleConnected(api));
      api.on('ready', () => dispatch({ type: SUBSTRATE_ACTIONS.CONNECT_SUCCESS, payload: api }));
      api.on('error', (err) => handleError(err));
      api.on('disconnected', () => handleDisconnected(provider));
    };
    connect();
  }, []);

  return (
    <SubstrateContext.Provider value={state}>
      {children}
    </SubstrateContext.Provider>
  );
};

SubstrateContextProvider.propTypes = {
  children: PropTypes.any
};

const useSubstrate = () => ({ ...useContext(SubstrateContext) });

export { SubstrateContextProvider, useSubstrate };
