import type { NextPage } from "next/types";
import styles from "../../styles/components/misc/DateDisplay.module.css";
import { Dispatch, ReactElement, SetStateAction } from "react";

type DateDisplayProps = {
  millis: number | undefined;
};

function convertMiliseconds(miliseconds: number) {
  const total_seconds = Math.floor(miliseconds / 1000);
  const total_minutes = Math.floor(total_seconds / 60);
  const total_hours = Math.floor(total_minutes / 60);
  const days = Math.floor(total_hours / 24);

  const seconds = total_seconds % 60;
  const minutes = total_minutes % 60;
  const hours = total_hours % 24;

  return { days, hours, minutes, seconds };
}

const DateDisplay: NextPage<DateDisplayProps> = ({ millis }) => {
  if (millis === undefined) {
    return <div>We couldn&apos;t find the next game</div>;
  }
  const date = convertMiliseconds(millis);

  return (
    <div className={styles.mainDiv}>
      <div className={styles.digitDiv}>
        <p className={styles.number}>{date.days}</p>
        <span className={styles.type}>{"Days"}</span>
      </div>
      <p className={styles.colon}>:</p>
      <div className={styles.digitDiv}>
        <p className={styles.number}> {date.hours}</p>
        <span className={styles.type}>{"Hours"}</span>
      </div>
      <p className={styles.colon}>:</p>
      <div className={styles.digitDiv}>
        <p className={styles.number}>{date.minutes}</p>
        <span className={styles.type}>{"Minutes"}</span>
      </div>
      <p className={styles.colon}>:</p>
      <div className={styles.digitDiv}>
        <p className={styles.number}>{date.seconds}</p>
        <span className={styles.type}>{"Seconds"}</span>
      </div>
    </div>
  );
};

export default DateDisplay;
