import Navbar from 'components/Navbar';
import OnGoingTaskNotification from './components/OnGoingTaskModal';
import Main from './Main';
import { SBTContextProvider } from './SBTContext';
import { FaceRecognitionContextProvider } from './SBTContext/faceRecognitionContext';
import { GeneratedContextProvider } from './SBTContext/generatedContext';
import { GeneratingContextProvider } from './SBTContext/generatingContext';
import { SBTPrivateContextProvider } from './SBTContext/sbtPrivateWalletContext';
import { SBTThemeContextProvider } from './SBTContext/sbtThemeContext';

import 'swiper/swiper.scss'; // core Swiper
import 'swiper/modules/navigation/navigation.scss'; // Navigation module
import 'swiper/modules/pagination/pagination.scss'; // Pagination module

const SBT = () => {
  return (
    <SBTContextProvider>
      <FaceRecognitionContextProvider>
        <SBTThemeContextProvider>
          <GeneratingContextProvider>
            <GeneratedContextProvider>
              <SBTPrivateContextProvider>
                <div className="text-white min-h-screen flex flex-col">
                  <Navbar showZkBtn={true} />
                  <Main />
                  <OnGoingTaskNotification />
                </div>
              </SBTPrivateContextProvider>
            </GeneratedContextProvider>
          </GeneratingContextProvider>
        </SBTThemeContextProvider>
      </FaceRecognitionContextProvider>
    </SBTContextProvider>
  );
};
export default SBT;
