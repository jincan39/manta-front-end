// @ts-nocheck
import React from 'react';
import AppRouter from 'AppRouter';
import GlobalContexts from 'contexts/globalContexts';

function App() {
  return (
    <div className="main-app bg-primary">
      <div className="flex flex-col m-auto">
        <div className="min-h-screen">
          <GlobalContexts>
            <AppRouter />
          </GlobalContexts>
        </div>
      </div>
    </div>
  );
}

export default App;
