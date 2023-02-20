// @ts-nocheck
import React from 'react';
import PageContent from 'components/PageContent';
import Navbar from 'components/Navbar';
import { SendContextProvider } from './SendContext';
import { PrivateTxHistoryContextProvider } from './privateTxHistoryContext';
import SendForm from './SendForm';

const SendPage = () => {
  return (
    <SendContextProvider>
      <PrivateTxHistoryContextProvider>
        <Navbar />
        <PageContent>
          <SendForm />
        </PageContent>
      </PrivateTxHistoryContextProvider>
    </SendContextProvider>
  );
};

export default SendPage;
