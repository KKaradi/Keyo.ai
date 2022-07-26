import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/multiwordle/dialogue/WinDialogue.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPage } from "next/types";
import SlideTransition from "../dialogs/SlideTransition";
import { colors } from "../../constants/colors";
import { ReturnGameMove } from "../../pages/api/post/multiwordle";

type WinDialogueProps = {
  open: boolean;
  gameStack: ReturnGameMove[];
};
//🟥🟧🟨🟩🟦🟪🟫⬛⬜💠🔳🔲
const levelToSquare = ["💠", "🟩", "⬜", "◻️", "◽"];

function msToTime(duration: number): string {
  //const milliseconds = Math.floor((duration % 1000) / 100);
  let seconds: number | string = Math.floor((duration / 1000) % 60);
  let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60);
  let hours: number | string = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days: number = Math.floor(duration / 86_400_000);
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return (days +
    " days and " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    ".") as string;
}

const WinDialogue: NextPage<WinDialogueProps> = ({ open, gameStack }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    setInterval(() => {
      setNow(new Date());
    }, 1000);
  });

  const statsString = gameStack
    .map((gameState, idx) => {
      const level = gameState.stats?.level;
      const defaltStr =
        idx % 5 == 0 && idx !== gameStack.length - 1 ? "\n" : "";
      if (level !== undefined) {
        return levelToSquare[level] + defaltStr ?? defaltStr;
      }
      return defaltStr;
    })
    .reverse()
    .join("");

  const numberOfGuesse = gameStack.length - 1;

  const timeToNextGame = msToTime(
    new Date(gameStack[0].nextGameDate).getTime() - now.getTime()
  );

  return (
    <Dialog
      open={open}
      TransitionComponent={SlideTransition}
      keepMounted
      onClose={() => setIsOpen(false)}
      PaperProps={{
        style: {
          backgroundColor: colors.green,
          boxShadow: "none",
          width: "100%",
        },
      }}
    >
      <DialogTitle>
        <h1 className={styles.dialogTitle}>🎉 You Won 🎉</h1>
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={styles.dialogContent}>
          <p>Congrats on finishing today&apos;s multiwordle</p>
          <p>
            Number of Guesses: {numberOfGuesse} <br />
          </p>
          <p className={styles.text}>
            Game History: <br />
            {statsString}
          </p>
          <p>Next Game:</p>
          {timeToNextGame}
        </DialogContentText>
      </DialogContent>

      <Button
        variant="contained"
        className={styles.dialogButton}
        size="large"
        onClick={() => setIsOpen(false)}
        style={{
          borderRadius: 15,
          color: colors.gray,
          backgroundColor: colors.accent,
          fontSize: "18px",
        }}
      >
        OK
      </Button>
    </Dialog>
  );
};

export default WinDialogue;
