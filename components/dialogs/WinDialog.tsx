import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/WinDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { GameMove } from "../../schemas";
import { colors } from "../../constants/colors";

type WinDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  gameStack: GameMove[];
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
        },
      }}
    >
      {/* <DialogTitle>🎉 You Won 🎉</DialogTitle> */}
      <DialogContent>
        <h1>🎉 You Won 🎉</h1>
        <DialogContentText className={styles.dialogContent}>
          Congrats on finishing today&apos;s multiwordle <br />
          Number of Guesses: {numberOfGuesse}
          <br />
          Game History: {statsString}
          {/* Next Game: {timeToNextGame} */}
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
