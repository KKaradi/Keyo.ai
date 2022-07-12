import type { NextPage } from "next/types";
import { useEffect, useState } from "react";
import styles from "../styles/components/ImageChoice.module.css";

type Easing = (duration: number, range: number, current: number) => number;

const quadratic: Easing = (duration, range, current) => {
  return ((duration * 3) / Math.pow(range, 3)) * Math.pow(current, 2);
};

type AnimatedPercentageProps = {
  end: number;
  startValue?: number;
  durationValue?: number;
};

const AnimatedPercentage: NextPage<AnimatedPercentageProps> = ({
  startValue,
  end,
  durationValue,
}) => {
  const start = startValue ?? 0;
  const duration = durationValue ?? 1000;

  const range = end - start;
  const increment = 1;
  let current = start;

  const [value, setValue] = useState(current);
  const step = () => {
    current += increment;
    setValue(current);

    if (current < end) setTimeout(step, quadratic(duration, range, current));
  };

  useEffect(() => {
    if (range != 0) setTimeout(step, quadratic(duration, range, current));
  }, []);

  return <h1 className={styles.percentage}>{value}%</h1>;
};

export default AnimatedPercentage;
