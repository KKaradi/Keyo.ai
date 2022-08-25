import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/WinDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { GameMove } from "../../schemas";
import { colors } from "../../constants/colors";
import ShareIcon from "@mui/icons-material/Share";
import PopUp from "../misc/PopUp";
import DateDisplay from "../misc/DateDisplay";
import Tooltip from "@mui/material/Tooltip";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
type WinDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  gameStack: GameMove[];
  globalPosition: number | undefined;
  usingWallet: boolean;
  buyNFTDialogState: [boolean, Dispatch<SetStateAction<boolean>>];
};

const positionToSufix = {
  1: "st",
  2: "nd",
  3: "rd",
} as { [key: number]: string };

//🟥🟧🟨🟩🟦🟪🟫⬛⬜💠🔳🔲

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

const WinDialog: NextPage<WinDialogProps> = ({
  isOpen,
  setIsOpen,
  usingWallet,
  gameStack,
  buyNFTDialogState,
  globalPosition,
}) => {
  let scoreString = "";
  gameStack.forEach(
    (gameState) => (scoreString += statToScoreString(gameState))
  );
  const [openPopUp, setOpenPopUp] = useState(false);
  const numberOfGuesse = gameStack.length - 1;

  const nextGame = gameStack[0].nextGameDate ?? Date.now();
  const nextGameUTC = new Date(nextGame).getTime();
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
          borderRadius: "10px",
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
            {globalPosition
              ? `You were the ${globalPosition}${
                  positionToSufix[globalPosition] ?? "th"
                } person to finish today`
              : `We couldn't find your global position`}
          </div>
          <div className={styles.chunk}>
            <Tooltip
              title={
                "✨: 2+ words completed in that guess. ⭐: 1 word completed. 🟩: 1+ green letters. 🟨 1+ yellow letters. ⬛: 0 letters."
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
                `Keyo #${gameStack[0].gameId} ${
                  gameStack.length - 1
                } guesses (#${globalPosition})\n` + scoreString
              );
            }}
          >
            Share <ShareIcon />
          </div>
          {usingWallet ? (
            <div
              className={styles.buyButton}
              onClick={() => {
                setIsOpen(false);
                buyNFTDialogState[1](true);
              }}
            >
              Purchase NFT <AccountBalanceWalletIcon />
            </div>
          ) : (
            <></>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinDialog;
