// @ts-nocheck
import React from 'react';
import PageContent from 'components/PageContent';
import Navbar from 'components/Navbar';
import DowntimeModal from 'components/Modal/downtimeModal';
import { BridgeDataContextProvider } from './BridgeContext/BridgeDataContext';
import { BridgeTxContextProvider } from './BridgeContext/BridgeTxContext';
import BridgeForm from './BridgeForm';


const BridgePage = () => {
  return (
    <BridgeDataContextProvider>
      <BridgeTxContextProvider>
        <Navbar />
        <PageContent>
          <BridgeForm />
        </PageContent>
        <DowntimeModal />
      </BridgeTxContextProvider>
    </BridgeDataContextProvider>
  );
};

export default BridgePage;
