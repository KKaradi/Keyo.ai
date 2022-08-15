import type { NextPage } from "next/types";
import { ReactElement } from "react";
import styles from "../../styles/components/multiwordle/Tutorial.module.css";
type TutorialProps = { children: ReactElement; inTutorial: boolean };

const Tutorial: NextPage<TutorialProps> = ({ children, inTutorial }) => {
  return (
    <div>
      {inTutorial ? <div className={styles.cover}></div> : <div></div>}
      <div>{children}</div>
    </div>
  );
};

export default Tutorial;
