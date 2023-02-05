import { useState, useEffect } from 'react';

import { Step, useSBT } from 'pages/SBTPage/SBTContext';
import { useGenerating } from 'pages/SBTPage/SBTContext/generatingContext';

const PROGRESS_MAX = 251.327;
const PROGRESS_SPEED = 1;
const PROGRESS_BEFORE_FINISH = 240;

const REMAIN_TIME_BEFORE_FINISH = 5;

const Progress = () => {
  const [progress, setProgress] = useState(0);
  const [remainTime, setRemainTime] = useState(20);

  const { setCurrentStep } = useSBT();
  const { generateStatus } = useGenerating();

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress >= PROGRESS_BEFORE_FINISH) {
        clearInterval(timer);
        return;
      }
      setProgress(Math.min(PROGRESS_BEFORE_FINISH, progress + PROGRESS_SPEED));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [progress, setCurrentStep]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainTime <= REMAIN_TIME_BEFORE_FINISH) {
        clearInterval(timer);
      }
      setRemainTime(remainTime - 1);
    }, 60000);
    return () => {
      clearInterval(timer);
    };
  }, [remainTime]);

  useEffect(() => {
    if (generateStatus === 'finish') {
      setProgress(PROGRESS_MAX);
      setRemainTime(0);
      setTimeout(() => {
        setCurrentStep(Step.Generated);
      }, 100);
    }
  }, [generateStatus, setCurrentStep]);

  return (
    <div className="relative w-72 h-72 mt-6 leading-6 text-center">
      <svg
        className="CircularProgressbar "
        viewBox="0 0 100 100"
        data-test-id="CircularProgressbar">
        <path
          className="CircularProgressbar-trail"
          d="
M 50,50
m 0,-40
a 40,40 0 1 1 0,80
a 40,40 0 1 1 0,-80
"
          strokeWidth="6"
          fillOpacity="0"
          style={{
            stroke: 'rgb(5, 13, 50)',
            strokeDasharray: '251.327px, 251.327px',
            strokeDashoffset: '0px'
          }}></path>
        <path
          className="CircularProgressbar-path"
          d="
M 50,50
m 0,-40
a 40,40 0 1 1 0,80
a 40,40 0 1 1 0,-80
"
          strokeWidth="6"
          fillOpacity="0"
          style={{
            stroke: 'url("#sbt-progress")',
            height: '100%',
            strokeDasharray: '251.327px, 251.327px',
            strokeDashoffset: `${progress}px`,
            strokeLinecap: 'round'
          }}></path>
        <defs>
          <linearGradient id="sbt-progress" gradientTransform="rotate(90)">
            <stop offset="16.29%" stopColor="#2b49ea"></stop>
            <stop offset="85.56%" stopColor="#00afa5"></stop>
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-white text-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <span>Remaining</span>
        <h2 className="text-5xl">{remainTime}</h2>
        <span>min</span>
      </div>
    </div>
  );
};

export default Progress;
