import React from "react";
import styles from "./progress.module.css";

function useAnimateValue(value, duration) {
  const [current, setCurrent] = React.useState(value);

  React.useLayoutEffect(() => {
    const stepDuration = 1 / 50;
    const totalSteps = duration / stepDuration;
    const stepSize = (value - current) / totalSteps;
    let currentStep = 0;

    const interval = setInterval(
      () =>
        setCurrent((current) => {
          currentStep++;
          if (currentStep >= totalSteps) {
            clearInterval(interval);
            return value;
          }

          return current + stepSize;
        }),
      stepDuration * 1000
    );

    return () => clearInterval(interval);
  }, [value, duration]);

  return current;
}

const AnimatePercentage = React.memo(({ value, duration }) => {
  const v = useAnimateValue(value, duration);
  return Math.round(v * 100) / 100;
});

function _Progress({
  progress = 100,
  // innerStrokeWidth -> inner circle line width
  innerStrokeWidth = 3,
  // outerStrokeWidth -> outer circle line width
  outerStrokeWidth = 4.5,
  // ball diameter
  ballStrokeWidth = 20,
  // reduction -> total size of progress bar = change to quarter, half, third, etc.
  reduction = 0,
  // animations -> this will impact speed
  // if I need something faster/real-time set this to 0
  transitionDuration = 0,
  transitionTimingFunction = "ease",
  // default inner circle color
  background = "white",
  // change values
  hideBall = false,
  hideValue = false,
  // default line color
  gradient = [
    { stop: 0.0, color: "red" },
    { stop: 1, color: "red" },
  ],
  subtitle = "",
  style,
  className,
  suffix = "%",
  title,
  inputElements,
}) {
  progress = Math.round(progress * 100) / 100;
  const width = 200;
  const center = width / 2;
  const height = 200 || center + center * Math.cos(reduction * Math.PI);
  const [unique] = React.useState(() => Math.random().toString());
  const rotate = 180 + 90 + reduction;
  const r = center - outerStrokeWidth / 2 - ballStrokeWidth / 2;
  const circumference = Math.PI * r * 2;
  // wtf is offset?
  const offset = (circumference * (100 - progress * (1 - reduction))) / 100;

  return (
    <div className={`${className} ${styles.progress}`} style={style}>
      {/* represents svg total size -> viewBox{minWidth, minHeight, w,h} */}
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
        {/* gradient color initializer */}
        <defs>
          <linearGradient
            id={"gradient" + unique}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            {gradient.map(({ stop, color }) => (
              <stop
                key={stop}
                offset={stop * 100 + (suffix || "")}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>

        {/* number text */}
        {!hideValue && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            fontSize="30"
            fill="#3c3c3c"
          >
            {/* <AnimatePercentage value={progress} duration={transitionDuration} /> */}
            {/* literal string title */}
            {title}
          </text>
        )}

        {!hideValue && (
          <foreignObject
            x={center - 77}
            y={center - 20}
            width={160}
            height={40}
          >
            {/* Embed HTML content using foreignObject */}
            {inputElements}
          </foreignObject>
        )}

        {/* text under number */}
        <text
          x={center}
          y={center + (30 * 3) / 4}
          textAnchor="middle"
          fill="#9c9c9c"
        >
          {subtitle}
        </text>

        {/* inner progress circle */}
        <circle
          transform={`rotate(${rotate} ${center} ${center})`}
          id="path"
          cx={center}
          cy={center}
          r={r}
          strokeWidth={innerStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * reduction}
          fill="none"
          stroke={background}
          strokeLinecap="round"
        ></circle>

        {/* outer progress circle */}
        <circle
          style={{
            transition: `stroke-dashoffset ${transitionDuration}s ${transitionTimingFunction}`,
          }}
          transform={`rotate(${rotate} ${center} ${center})`}
          id="path"
          cx={center}
          cy={center}
          r={r}
          strokeWidth={outerStrokeWidth}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          fill="none"
          stroke={`url(#gradient${unique})`}
          strokeLinecap="round"
        ></circle>

        {/* starter ball */}
        {!hideBall && (
          <circle
            style={{
              transition: `stroke-dashoffset ${transitionDuration}s ${transitionTimingFunction}`,
            }}
            transform={`rotate(${rotate} ${center} ${center})`}
            id="path"
            cx={center}
            cy={center}
            r={r}
            strokeWidth={ballStrokeWidth}
            strokeDasharray={`1 ${circumference}`}
            // strokeDashoffset={offset}
            fill="none"
            stroke={`url(#gradient${unique})`}
            strokeLinecap="round"
          ></circle>
        )}

        {/* end ball */}
        {!hideBall && (
          <circle
            style={{
              transition: `stroke-dashoffset ${transitionDuration}s ${transitionTimingFunction}`,
            }}
            transform={`rotate(${rotate} ${center} ${center})`}
            id="path"
            cx={center}
            cy={center}
            r={r}
            strokeWidth={ballStrokeWidth}
            strokeDasharray={`1 ${circumference}`}
            // offsets ball -> disabling this will cause it to remain at the beginning
            strokeDashoffset={offset}
            fill="none"
            stroke={`url(#gradient${unique})`}
            strokeLinecap="round"
          ></circle>
        )}
      </svg>
    </div>
  );
}

export const Progress = React.memo(_Progress);
Progress.displayName = "Progress";

export default Progress;
