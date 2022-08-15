import type { NextPage } from "next/types";
import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import styles from "../../styles/components/dialogs/TutorialDialogue.module.css";
import CallReceivedIcon from "@mui/icons-material/CallReceived";

type TutorialDialogueProps = {
  inTutorial: boolean;
  fadeTutorialDialogue: [boolean, Dispatch<SetStateAction<boolean>>];
};

const TutorialDialogue: NextPage<TutorialDialogueProps> = ({
  inTutorial,
  fadeTutorialDialogue,
}) => {
  let component: ReactElement;
  if (fadeTutorialDialogue[0]) {
    component = (
      <div
        className={styles.fadingTutorialDiv}
        onAnimationEnd={() => fadeTutorialDialogue[1](false)}
      >
        <div className={styles.tutorialText}>
          Try typing a word that you think was used to generate this image
        </div>
        <CallReceivedIcon />
      </div>
    );
  } else if (inTutorial) {
    component = (
      <div
        className={styles.tutorialDiv}
        onAnimationEnd={() => fadeTutorialDialogue[1](true)}
      >
        <div className={styles.tutorialText}>
          Try typing a word that you think was used to generate this image
        </div>
        <CallReceivedIcon />
      </div>
    );
  } else {
    component = <></>;
  }

  return component;
};

export default TutorialDialogue;
