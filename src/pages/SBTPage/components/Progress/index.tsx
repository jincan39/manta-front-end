import { useState, useEffect } from 'react';

import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useGenerating } from 'pages/SBTPage/SBTContext/generatingContext';
import ProgressCircle from '../ProgressCircle';

const PROGRESS_MAX = 251.327;
const PROGRESS_SPEED = 1;
const PROGRESS_BEFORE_FINISH = 240;

const REMAIN_TIME_BEFORE_FINISH = 5;

const Progress = () => {
  const [progress, setProgress] = useState(0);
  const [remainMinutes, setRemainMinutes] = useState(20);

  const { setCurrentStep } = useSBT();
  const { generateStatus } = useGenerating();

  useEffect(() => {
    const updateProgress = () => {
      if (progress >= PROGRESS_BEFORE_FINISH) {
        clearInterval(timer);
        return;
      }
      setProgress(Math.min(PROGRESS_BEFORE_FINISH, progress + PROGRESS_SPEED));
    };

    const timer = setInterval(updateProgress, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [progress, setCurrentStep]);

  useEffect(() => {
    const updateRemainMinutes = () => {
      if (remainMinutes <= REMAIN_TIME_BEFORE_FINISH) {
        clearInterval(timer);
      }
      setRemainMinutes(remainMinutes - 1);
    };
    const timer = setInterval(updateRemainMinutes, 60000);
    return () => {
      clearInterval(timer);
    };
  }, [remainMinutes]);

  useEffect(() => {
    const handleFinishStatus = () => {
      if (generateStatus === 'finish') {
        setProgress(PROGRESS_MAX);
        setRemainMinutes(0);
        setTimeout(() => {
          setCurrentStep(Step.Generated);
        }, 100);
      }
    };
    handleFinishStatus();
  }, [generateStatus, setCurrentStep]);

  return (
    <div className="relative w-72 h-72 mt-6 leading-6 text-center">
      <ProgressCircle progress={progress} />
      <div className="absolute text-white text-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span>Remaining</span>
        <h2 className="text-5xl">{remainMinutes}</h2>
        <span>min</span>
      </div>
    </div>
  );
};

export default Progress;
