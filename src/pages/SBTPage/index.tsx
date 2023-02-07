import Navbar from 'components/Navbar';
import OnGoingTaskNotification from './components/OnGoingTaskModal';
import Main from './Main';
import { SBTContextProvider } from './SBTContext';
import { FaceRecognitionContextProvider } from './SBTContext/faceRecognitionContext';
import { GeneratingContextProvider } from './SBTContext/generatingContext';
import { SBTPrivateContextProvider } from './SBTContext/sbtPrivateWalletContext';
import { SBTThemeContextProvider } from './SBTContext/sbtThemeContext';

const SBT = () => {
  return (
    <SBTContextProvider>
      <FaceRecognitionContextProvider>
        <SBTThemeContextProvider>
          <GeneratingContextProvider>
            <SBTPrivateContextProvider>
              <div className="text-white min-h-screen flex flex-col">
                <Navbar showZkBtn={true} />
                <Main />
                <OnGoingTaskNotification />
              </div>
            </SBTPrivateContextProvider>
          </GeneratingContextProvider>
        </SBTThemeContextProvider>
      </FaceRecognitionContextProvider>
    </SBTContextProvider>
  );
};
export default SBT;
