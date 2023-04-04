// @ts-nocheck
import DeveloperConsole from 'components/Developer/DeveloperConsole';
import NETWORK from 'constants/NetworkConstants';
import { ConfigContextProvider, useConfig } from 'contexts/configContext';
import { ExternalAccountContextProvider } from 'contexts/externalAccountContext';
import { MantaSignerWalletContextProvider } from 'contexts/mantaSignerWalletContext';
import { MantaWalletContextProvider } from 'contexts/mantaWalletContext';
import { MetamaskContextProvider } from 'contexts/metamaskContext';
import { SubstrateContextProvider } from 'contexts/substrateContext';
import { TxStatusContextProvider, useTxStatus } from 'contexts/txStatusContext';
import { UsdPricesContextProvider } from 'contexts/usdPricesContext';
import { ZkAccountBalancesContextProvider } from 'contexts/zkAccountBalancesContext';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import initAxios from 'utils/api/initAxios';
import {
  showError,
  showInfo,
  showSuccess,
  showWarning
} from 'utils/ui/Notifications';

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
        <ExternalAccountContextProvider>
          <MantaWalletContextProvider>
            <DeveloperConsole />
            <TxStatusHandler />
            {children}
          </MantaWalletContextProvider>
        </ExternalAccountContextProvider>
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
