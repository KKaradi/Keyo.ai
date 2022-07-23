import { useState, ReactElement } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/multiwordle/dialogue/MoreInfo.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPage } from "next/types";
import SlideTransition from "../dialogs/SlideTransition";
import { colors } from "../../constants/colors";

type MoreInfoProps = {
  children: ReactElement;
};

const MoreInfo: NextPage<MoreInfoProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: colors.gray,
            boxShadow: "none",
            width: "100%",
          },
        }}
      >
        <DialogTitle>
          <h1 className={styles.dialogTitle}>How to play?</h1>
        </DialogTitle>
        <DialogContent>
          <DialogContentText className={styles.dialogContent}>
            <p>
              First we started with a sentence. Then we asked an AI to draw that
              sentence. That&apos;s what you see on the left. Your job is guess
              the sentence that was use to draw the image
            </p>
            <p>
              You can enter a guess just by typing and hitting enter. Each guess
              applies to every word in the sentence.
            </p>
            <p>
              For each letter green means its in the correct spot, yellow means
              its in the wrong spot and gray means its not in the word. You can
              find a history of your guess by click each word.
            </p>
          </DialogContentText>
        </DialogContent>

        <Button
          variant="contained"
          className={styles.dialogButton}
          size="large"
          onClick={() => setIsOpen(false)}
          style={{
            borderRadius: 15,
            backgroundColor: colors.green,
            fontSize: "18px",
          }}
        >
          OK
        </Button>
      </Dialog>
    </div>
  );
};

export default MoreInfo;
