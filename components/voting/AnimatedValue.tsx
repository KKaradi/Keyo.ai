import type { NextPage } from "next/types";
import { useEffect, useState } from "react";
import styles from "../../styles/components/voting/ImageChoice.module.css";

type Easing = (duration: number, range: number, current: number) => number;

const quadratic: Easing = (duration, range, current) => {
  return ((duration * 3) / Math.pow(range, 3)) * Math.pow(current, 2);
};

type AnimatedPercentageProps = {
  endValue: number;
  startValue?: number;
  durationValue?: number;
  incrementValue?: number;
  suffix?: string;
};

const AnimatedValue: NextPage<AnimatedPercentageProps> = ({
  startValue,
  endValue,
  durationValue,
  incrementValue,
  suffix,
}) => {
  const start = startValue ?? 0;
  const duration = durationValue ?? 1000;
  const increment = incrementValue ?? 1;
  suffix = suffix ?? "";

  const range = endValue - start;

  let current = start;

  const [value, setValue] = useState(current);

  const step = () => {
    current += increment;
    setValue(current);

    if (current < endValue)
      setTimeout(step, quadratic(duration, range, current));
  };

  useEffect(() => {
    if (range != 0) setTimeout(step, quadratic(duration, range, current));
  }, []);

  return (
    <h1 className={styles.percentage}>
      {value}
      {suffix}
    </h1>
  );
};

export default AnimatedValue;
