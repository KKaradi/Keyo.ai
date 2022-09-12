import type { NextPage } from "next/types";
import { Dispatch, ReactElement, SetStateAction } from "react";
import styles from "../../styles/components/dialogs/TutorialDialog.module.css";
import CallReceivedIcon from "@mui/icons-material/CallReceived";

type TutorialDialogProps = {
  inTutorial: boolean;
  fadeTutorialDialog: [boolean, Dispatch<SetStateAction<boolean>>];
};

const TutorialDialog: NextPage<TutorialDialogProps> = ({
  inTutorial,
  fadeTutorialDialog,
}) => {
  let component: ReactElement;
  if (fadeTutorialDialog[0]) {
    component = (
      <div
        className={styles.fadingTutorialDiv}
        onAnimationEnd={() => fadeTutorialDialog[1](false)}
      >
        <div className={styles.tutorialText}>
          Try typing a word that you think was used to generate this image.
          <br /> Then hit <b>ENTER</b>.
        </div>
        <CallReceivedIcon />
      </div>
    );
  } else if (inTutorial) {
    component = (
      <div
        className={styles.tutorialDiv}
        onAnimationEnd={() => fadeTutorialDialog[1](true)}
      >
        <div className={styles.tutorialText}>
          Try typing a word that you think was used to generate this image. Then
          hit <b>ENTER</b>.
        </div>
        <CallReceivedIcon />
      </div>
    );
  } else {
    component = <></>;
  }

  return component;
};

export default TutorialDialog;
