import { ReactElement } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/HowToPlayDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { colors } from "../../constants/colors";

import Square from "../misc/Square";

type HowToPlayDialogProps = {
  children: ReactElement;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const HowToPlayDialog: NextPage<HowToPlayDialogProps> = ({
  children,
  isOpen,
  setIsOpen,
}) => {
  return (
    <div>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
      >
        <DialogContent>
          <h1>How To Play</h1>
          <hr className={styles.rule} />
          Your goal is the guess the caption used to create this AI generated
          image (Click the learn icon if you want to learn more). Type a word
          you think was in the caption and hit enter to make your guess. Our
          caption is a sentence, so each guess is actually a guess for every
          word in the caption. After you enter your guess you can see how well
          your guess matched the caption. If you want to see the results of past
          guesses click on a word.
          <br />
          <h2>What do your results mean?</h2>
          <hr className={styles.rule} />
          <div className={styles.examples}>
            <div className={styles.word}>
              <div className={styles.character}>
                <Square character={"w"} color="green" />
              </div>
              <div className={styles.character}>
                <Square character={"e"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"a"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"r"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"y"} color="empty" />
              </div>
            </div>
            The letter W is in the word and in the correct spot.
            <div className={styles.word}>
              <div className={styles.character}>
                <Square character={"p"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"i"} color="yellow" />
              </div>
              <div className={styles.character}>
                <Square character={"l"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"l"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"s"} color="empty" />
              </div>
            </div>
            The letter I is in the word but in the wrong spot.
            <div className={styles.word}>
              <div className={styles.character}>
                <Square character={"v"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"a"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"g"} color="empty" />
              </div>
              <div className={styles.character}>
                <Square character={"u"} color="gray" />
              </div>
              <div className={styles.character}>
                <Square character={"e"} color="empty" />
              </div>
            </div>
            The letter U is not in the word in any spot.
          </div>
          {/* </DialogContentText> */}
          {/* <hr className={styles.rule} /> */}
          {/* <Timelapse /> */}
        </DialogContent>

        <Button
          variant="contained"
          className={styles.dialogButton}
          size="large"
          onClick={() => setIsOpen(false)}
          style={{
            borderRadius: 15,
            color: colors.gray,
            backgroundColor: "white",
            fontSize: "18px",
          }}
        >
          OK
        </Button>
      </Dialog>
    </div>
  );
};

export default HowToPlayDialog;
