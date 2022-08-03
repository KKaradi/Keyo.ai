import { ReactElement } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/HowToPlayDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { colors } from "../../constants/colors";
import Timelapse from "../misc/Timelapse";
import Square from "../misc/Square";
import Typography from "@mui/material/Typography";

type HowToPlayDialogProps = {
  children: ReactElement;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

// First we started with a sentence. Then we asked an AI to draw that
//             sentence. That&apos;s what you see on the left. Your job is guess
//             the sentence that was use to draw the image You can enter a guess
//             just by typing and hitting enter. Each guess applies to every word
//             in the sentence. For each letter green means its in the correct
//             spot, yellow means its in the wrong spot and gray means its not in
//             the word. You can find a history of your guess by click each word.
//             Do you see that gif down there. That&apos;s a ai generating an image
//             from the prompt &quot;__&quot;.
//             <br />
const HowToPlayDialogue: NextPage<HowToPlayDialogProps> = ({
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
          We got an AI to create an image using a mystery caption (Click the
          learn icon if you want to find out more). Your goal is the guess that
          caption using wordle. Enter a guess by typing a word and hitting
          enter. Our caption is a sentence so every guess fills out every word.
          After you enter your guess you can see your results. If you want to
          see the results of past guesses click on a word.
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

export default HowToPlayDialogue;
