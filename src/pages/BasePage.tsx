// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import React from 'react';
import PropTypes from 'prop-types';
import initAxios from 'utils/api/initAxios';
import { ConfigContextProvider, useConfig } from 'contexts/configContext';
import { ExternalAccountContextProvider } from 'contexts/externalAccountContext';
import { SubstrateContextProvider } from 'contexts/substrateContext';
import { MetamaskContextProvider } from 'contexts/metamaskContext';
import DeveloperConsole from 'components/Developer/DeveloperConsole';
import { TxStatusContextProvider, useTxStatus } from 'contexts/txStatusContext';
import { useEffect } from 'react';
import {
  showError,
  showInfo,
  showSuccess,
  showWarning
} from 'utils/ui/Notifications';
import { UsdPricesContextProvider } from 'contexts/usdPricesContext';
import { MantaWalletContextProvider } from 'contexts/mantaWalletContext';
import { MantaSignerWalletContextProvider } from 'contexts/mantaSignerWalletContext';
import { ZkAccountBalancesContextProvider } from 'contexts/zkAccountBalancesContext';

const TxStatusHandler = () => {
  const { txStatus, setTxStatus } = useTxStatus();

  useEffect(() => {
    if (txStatus?.isFinalized()) {
      showSuccess(txStatus.subscanUrl, txStatus?.extrinsic);
      setTxStatus(null);
    } else if (txStatus?.isFailed()) {
      showError(txStatus.message || 'Transaction failed');
      setTxStatus(null);
    } else if (txStatus?.isProcessing() && txStatus.message) {
      showInfo(txStatus.message);
    } else if (txStatus?.isDisconnected()) {
      showWarning('Network disconnected');
      setTxStatus(null);
    }
  }, [txStatus]);

  return <div />;
};

const BasePage = ({ children }) => {
  const config = useConfig();
  useEffect(() => {
    initAxios(config);
  }, []);
  return (
    <TxStatusContextProvider>
      <SubstrateContextProvider>
        <MantaWalletContextProvider>
          <ExternalAccountContextProvider>
            <DeveloperConsole />
            <TxStatusHandler />
            {children}
          </ExternalAccountContextProvider>
        </MantaWalletContextProvider>
      </SubstrateContextProvider>
    </TxStatusContextProvider>
  );
};

BasePage.propTypes = {
  children: PropTypes.any
};

export const CalamariBasePage = ({ children }) => {
  return (
    <ConfigContextProvider network={NETWORK.CALAMARI}>
      <BasePage>
        <UsdPricesContextProvider>
          <MetamaskContextProvider>
            <MantaSignerWalletContextProvider>
              <ZkAccountBalancesContextProvider>
                {children}
              </ZkAccountBalancesContextProvider>
            </MantaSignerWalletContextProvider>
          </MetamaskContextProvider>
        </UsdPricesContextProvider>
      </BasePage>
    </ConfigContextProvider>
  );
};

CalamariBasePage.propTypes = {
  children: PropTypes.any
};

export const DolphinBasePage = ({ children }) => {
  return (
    <ConfigContextProvider network={NETWORK.DOLPHIN}>
      <BasePage>
        <UsdPricesContextProvider>
          <MetamaskContextProvider>
            <MantaSignerWalletContextProvider>
              <ZkAccountBalancesContextProvider>
                {children}
              </ZkAccountBalancesContextProvider>
            </MantaSignerWalletContextProvider>
          </MetamaskContextProvider>
        </UsdPricesContextProvider>
      </BasePage>
    </ConfigContextProvider>
  );
};

DolphinBasePage.propTypes = {
  children: PropTypes.any
};
