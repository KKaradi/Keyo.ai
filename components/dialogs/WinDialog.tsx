import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/WinDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { GameMove, GameStatusSchema, Stats } from "../../schemas";
import { colors } from "../../constants/colors";
import ShareIcon from "@mui/icons-material/Share";
import PopUp from "../misc/PopUp";
import DateDisplay from "../misc/DateDisplay";
import Tooltip from "@mui/material/Tooltip";

type WinDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  gameStack: GameMove[];
  globalPosition: number | undefined;
};

const positionToSufix = {
  1: "st",
  2: "nd",
  3: "rd",
} as { [key: number]: string };

//🟥🟧🟨🟩🟦🟪🟫⬛⬜💠🔳🔲
const levelToSquare = ["💠", "🟩", "⬜", "◻️", "◽"];

const statToScoreString = (gameMove: GameMove | undefined): string => {
  if (!gameMove?.stats) return "";
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

function updateTimeToNextGame(
  setMillisToNextGame: Dispatch<SetStateAction<number>>,
  nextGameUTC: number
) {}

const WinDialog: NextPage<WinDialogProps> = ({
  isOpen,
  setIsOpen,
  gameStack,
  globalPosition,
}) => {
  let scoreString = "";
  gameStack.forEach(
    (gameState) => (scoreString += statToScoreString(gameState))
  );
  const [openPopUp, setOpenPopUp] = useState(false);
  const numberOfGuesse = gameStack.length - 1;
  const nextGameUTC = new Date(gameStack[0].nextGameDate).getTime();
  const [millisToNextGame, setMillisToNextGame] = useState(
    nextGameUTC - Date.now()
  );

  useEffect(() => {
    setInterval(() => {
      setMillisToNextGame(nextGameUTC - Date.now());
    }, 1000);
  }, []);

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
            Number of Guesses: {numberOfGuesse}
          </div>
          <div className={styles.chunk}>
            {`You were the ${globalPosition}${
              positionToSufix[globalPosition ?? 0] ?? "th"
            } person to finish today`}
          </div>
          <div className={styles.chunk}>
            <Tooltip
              title={
                "A summary of each move in your game. ✨: 2+ words completed. ⭐: 1 word completed. 🟩: 1+ green letters. 🟨 1+ yellow letters. ⬛: no letters completed. Share your score with the share button."
              }
            >
              <div>History: {scoreString}</div>
            </Tooltip>
          </div>
          {millisToNextGame > 0 ? (
            <div className={styles.chunk}>
              <DateDisplay millis={millisToNextGame} />
            </div>
          ) : (
            <div className={styles.chunk}>
              <DateDisplay
                millis={millisToNextGame > 0 ? millisToNextGame : 0}
              />
              <div
                className={styles.nextGameButton}
                onClick={() => window.location.reload()}
              >
                Click for next game
              </div>
            </div>
          )}

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
