import { useState, ReactElement } from "react";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { get, clipboard } from "../../helpers";
import type { Response } from "../../pages/api/get/leaderboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import styles from "../../styles/components/dialogs/Leaderboard.module.css";
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

  return (
    <div>
      <div onClick={openLeaderboard}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: colors.background,
            boxShadow: "none",
          },
        }}
      >
        <div className={styles.container}>
          <DialogTitle>
            <h1 className={styles.dialogTitle}>Voting Leaderboards</h1>
            <hr style={{ borderWidth: 2 }} />
          </DialogTitle>
          <List sx={{ pt: 0 }}>
            <ListItem>
              <ListItemAvatar>
                <EmojiEventsIcon
                  fontSize="inherit"
                  sx={{
                    color: trophyColors[0],
                    opacity: 0, // the opacity is 0 as this icon is used to keep the padding of the header consistent with the rest of the rows
                    marginBottom: "20px",
                    fontSize: "26px",
                  }}
                />
              </ListItemAvatar>
              <ListItemText>
                <div className={styles.wrapper}>
                  <div className={styles.addressColumnHeader}>{"Address"}</div>
                  <div className={styles.voteColumnHeader}>{"Votes"}</div>
                </div>
              </ListItemText>
            </ListItem>
            {addresses.splice(0, 7).map(({ walletAddress, votes }, index) => (
              <ListItem
                key={walletAddress}
                onClick={() => clipboard(walletAddress)}
              >
                <ListItemAvatar>
                  <EmojiEventsIcon
                    fontSize="inherit"
                    sx={{
                      color: trophyColors[index],
                      opacity: index < 3 ? 1 : 0,
                      marginBottom: "20px",
                      fontSize: "26px",
                    }}
                  />
                </ListItemAvatar>
                <ListItemText>
                  <div className={styles.wrapper}>
                    <div className={styles.address}>
                      {ellipsize(walletAddress, 30)}
                    </div>
                    <div className={styles.score}>{votes}</div>
                  </div>
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </div>
        <Button
          variant="contained"
          className={styles.dialogButton}
          size="medium"
          onClick={() => setIsOpen(false)}
        >
          OK
        </Button>
      </Dialog>
    </div>
  );
};

export default LeaderboardDialog;
