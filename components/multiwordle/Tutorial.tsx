import type { NextPage } from "next/types";
import { ReactElement } from "react";
import styles from "../../styles/components/multiwordle/Tutorial.module.css";
type TutorialProps = { children: ReactElement; inTutorial: boolean };

const Tutorial: NextPage<TutorialProps> = ({ children, inTutorial }) => {
  return (
    <div className={styles.container}>
      {inTutorial ? <div className={styles.cover} /> : <div />}
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default Tutorial;
