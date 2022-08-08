import Dialog from "@mui/material/Dialog";
import type { NextPage } from "next/types";

import styles from "../../styles/components/multiwordle/PopUp.module.css";
import WarningIcon from "@mui/icons-material/Warning";
import { Dispatch, SetStateAction } from "react";
// styles\components\multiwordle\PopUp.modules.css
type PopUpProps = {
  text: string;
  alertLevel: "warning" | "normal";
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const PopUp: NextPage<PopUpProps> = ({ text, alertLevel, open, setOpen }) => {
  if (open) {
    switch (alertLevel) {
      case "warning":
        return (
          <div
            className={styles.popUpWarning}
            onAnimationEnd={() => {
              setOpen(false);
            }}
          >
            {text}
            <WarningIcon />
          </div>
        );
      case "normal":
        return (
          <div
            className={styles.popUp}
            onAnimationEnd={() => {
              setOpen(false);
            }}
          >
            {text}
          </div>
        );
    }
  } else {
    return <div />;
  }
};

export default PopUp;
