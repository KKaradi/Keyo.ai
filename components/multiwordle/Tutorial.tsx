import type { NextPage } from "next/types";
import { ReactElement, useState } from "react";
import styles from "../../styles/components/multiwordle/Tutorial.module.css";

type TutorialProps = {
  children: ReactElement;
  inTutorial: boolean;
  setInTutorial: (val: boolean) => void;
};

const Tutorial: NextPage<TutorialProps> = ({
  children,
  inTutorial,
  setInTutorial,
}) => {
  return (
    <div
      className={styles.container}
      onClick={() => {
        setInTutorial(false);
        localStorage.setItem("completedTutorial", "true");
      }}
    >
      {inTutorial ? <div className={styles.cover}></div> : <div></div>}
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default Tutorial;
