import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/WinDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { colors } from "../../constants/colors";
import { ReturnGameMove } from "../../pages/api/post/multiwordle";

type WinDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  gameStack: ReturnGameMove[];
};

//🟥🟧🟨🟩🟦🟪🟫⬛⬜💠🔳🔲
const levelToSquare = ["💠", "🟩", "⬜", "◻️", "◽"];

function msToTimeString(duration: number): string {
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
    seconds) as string;
}

const WinDialog: NextPage<WinDialogProps> = ({
  isOpen,
  setIsOpen,
  gameStack,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setInterval(() => {
      setNow(new Date());
    }, 10000);
  });

  const statsString = gameStack
    .map((gameState) => {
      const level = gameState.stats?.level;
      if (level !== undefined) {
        return levelToSquare[level] ?? "";
      }
      return "";
    })
    .reverse()
    .join("");

  const numberOfGuesse = gameStack.length - 1;
  const nextGameDate = gameStack[0].nextGameDate;

  let timeToNextGame = "Error";
  if (nextGameDate !== undefined) {
    timeToNextGame = msToTimeString(
      new Date(nextGameDate).getTime() - now.getTime()
    );
  }

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
        },
      }}
    >
      <DialogTitle>
        <h1 className={styles.dialogTitle}>🎉 You Won 🎉</h1>
      </DialogTitle>
      <DialogContent>
        <DialogContentText className={styles.dialogContent}>
          <p className={styles.text}>
            Congrats on finishing today&apos;s multiwordle
          </p>
          <p className={styles.text}>Number of Guesses: {numberOfGuesse}</p>
          <p className={styles.text}>Game History: {statsString}</p>
          <p className={styles.text}>Next Game: {timeToNextGame}</p>
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

export default WinDialog;
