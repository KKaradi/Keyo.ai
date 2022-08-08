import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/WinDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { GameMove, GameStatusSchema, Stats } from "../../schemas";
import { colors } from "../../constants/colors";
import ShareIcon from "@mui/icons-material/Share";
import PopUp from "../multiwordle/PopUp";
type WinDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  gameStack: GameMove[];
};

//🟥🟧🟨🟩🟦🟪🟫⬛⬜💠🔳🔲
const levelToSquare = ["💠", "🟩", "⬜", "◻️", "◽"];

// function msToTimeString(duration: number): string {
//   let seconds: number | string = Math.floor((duration / 1000) % 60);
//   let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60);
//   let hours: number | string = Math.floor((duration / (1000 * 60 * 60)) % 24);
//   const days: number = Math.floor(duration / 86_400_000);
//   hours = hours < 10 ? "0" + hours : hours;
//   minutes = minutes < 10 ? "0" + minutes : minutes;
//   seconds = seconds < 10 ? "0" + seconds : seconds;

//   return (days +
//     " days and " +
//     hours +
//     ":" +
//     minutes +
//     ":" +
//     seconds) as string;
// }

const statToScoreString = (gameMove: GameMove | undefined): string => {
  if (!gameMove?.stats) return "";
  // let scoreCharacter = "";
  // let skipFlag = true;
  // gameMove.inputs.forEach((input) => {
  //   if (skipFlag) {
  //     skipFlag = false;
  //     return;
  //   }
  //   if (input.completed) {
  //     scoreCharacter += "🟢";
  //     return;
  //   }
  //   let char = "⬛";
  //   for (const character of input.characters) {
  //     if (character.status === "green") {
  //       char = "🟩";
  //       break;
  //     }
  //     if (character.status === "yellow") {
  //       char = "🟨";
  //       break;
  //     }
  //   }
  //   scoreCharacter += char;
  // });
  // return "\n" + scoreCharacter;
  if (gameMove.stats.hitWords >= 2) {
    return "✨";
  }
  if (gameMove.stats.hitWords >= 1) {
    return "⭐";
  }
  if (gameMove.stats.greens >= 1) {
    return "🟩";
  }
  if (gameMove.stats.yellows >= 1) {
    return "🟨";
  }
  return "⬛";
};

const WinDialog: NextPage<WinDialogProps> = ({
  isOpen,
  setIsOpen,
  gameStack,
}) => {
  let scoreString = "";
  gameStack.forEach(
    (gameState) => (scoreString += statToScoreString(gameState))
  );
  const [openPopUp, setOpenPopUp] = useState(false);
  const numberOfGuesse = gameStack.length - 1;
  const nextGameDate = gameStack[0].nextGameDate;

  return (
    <Dialog
      open={isOpen}
      TransitionComponent={SlideTransition}
      keepMounted
      onClose={() => setIsOpen(false)}
      PaperProps={{
        style: {
          backgroundColor: colors.green,
          boxShadow: "none",
          width: "100%",
          textAlign: "center",
          borderRadius: "25px",
        },
      }}
    >
      <DialogContent>
        <PopUp
          text="Succesfully Copied"
          alertLevel="normal"
          open={openPopUp}
          setOpen={setOpenPopUp}
        />
        <h1 className={styles.title}>🎉 You Won 🎉</h1>
        <div className={styles.dialogContent}>
          <div className={styles.chunk}>
            Congratulations on completing today&apos;s multiwordle
          </div>
          <div className={styles.chunk}>
            Number of Guesses: {numberOfGuesse}
          </div>
          <div className={styles.chunk}>History: {scoreString}</div>
          <div className={styles.chunk}>Next Game: 21:03:12</div>
          <div
            className={styles.shareButton}
            onClick={() => {
              setOpenPopUp(true);
              navigator.clipboard.writeText(
                `Keyo #${gameStack[0].gameId} Guesses: ${
                  gameStack.length - 1
                }\n` + scoreString
              );
            }}
          >
            Share <ShareIcon />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinDialog;
