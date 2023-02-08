import Generated from './components/Generated';
import Generating from './components/Generating';
import Home from './components/Home';
import MintPanel from './components/MintPanel';
import ThemePanel from './components/ThemePanel';
import UploadPanel from './components/UploadPanel';
import { Step, useSBT } from './SBTContext';

const Main = () => {
  const { currentStep } = useSBT();
  if (currentStep === Step.Home) {
    return <Home />;
  }
  if (currentStep === Step.Upload) {
    return <UploadPanel />;
  }
  if (currentStep === Step.Theme) {
    return <ThemePanel />;
  }
  if (currentStep === Step.Generating) {
    return <Generating />;
  }
  if (currentStep === Step.Generated) {
    return <Generated />;
  }
  if (currentStep === Step.Mint) {
    return <MintPanel />;
  }
  return <Home />;
};

export default Main;
