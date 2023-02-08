const ProgressCircle = ({ progress }: { progress: number }) => {
  return (
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
  );
};

export default ProgressCircle;
