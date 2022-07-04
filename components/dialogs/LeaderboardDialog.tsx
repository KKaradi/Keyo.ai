import { useState, ReactElement } from "react";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { Dialog } from "@mui/material";
import { get, clipboard } from "../../helpers";
import type { Response } from "../../pages/api/get/leaderboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import styles from "../../styles/components/Leaderboard.module.css";
import { colors } from "../../constants/colors";

type LeaderboardDialogProps = {
  children: ReactElement;
};

const ellipsize = (word: string, limit = 21, ellipsis = "...") => {
  if (word.length < limit) return word;

  const chars = Math.floor(limit / 2) - ellipsis.length;
  return word.slice(0, chars) + ellipsis + word.slice(-chars);
};

const trophyColors = [colors.gold, colors.silver, colors.bronze];

const LeaderboardDialog: NextPage<LeaderboardDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Response["addresses"]>([]);

  const openLeaderboard = async () => {
    const result = await get("/api/get/leaderboard");
    if (result.status != 200) return;

    const { addresses: addressList } = (await result.json()) as Response;
    setAddresses(addressList);
    setIsOpen(true);
  };

  let placement = 1;
  const rows = addresses.map(({ walletAddress, votes, ens }, index) => {
    if (index > 0 && votes < addresses[index - 1].votes) placement++;

    return (
      <div className={styles.row} key={index}>
        <div
          className={styles.addressContainer}
          onClick={() => clipboard(walletAddress)}
        >
          <EmojiEventsIcon
            fontSize="large"
            sx={{
              color: trophyColors[placement - 1],
              opacity: placement <= 3 ? 1 : 0,
            }}
          />
          <h1 className={styles.address}>{ens ?? ellipsize(walletAddress)}</h1>
        </div>
        <h1 className={styles.score}> {votes}</h1>
      </div>
    );
  });

  return (
    <div>
      <div onClick={openLeaderboard}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
      >
        <div className={styles.container}>{rows}</div>
      </Dialog>
    </div>
  );
};

export default LeaderboardDialog;
