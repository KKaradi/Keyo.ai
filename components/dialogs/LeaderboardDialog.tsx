import { useState, ReactElement } from "react";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import {
  Avatar,
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
import styles from "../../styles/components/Leaderboard.module.css";
import { colors } from "../../constants/colors";
import { blue } from "@mui/material/colors";
import { fontSize } from '@mui/system';

type LeaderboardDialogProps = {
  children: ReactElement;
};

const ellipsize = (word: string, limit = 20, ellipsis = "...") => {
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

  //let placement = 1;
  // const rows = () => {
  //   <List>
  //     {addresses.map(({ walletAddress, votes }, index) => {
  //       <ListItem>
  //         {" "}
  //         <ListItemText primary={walletAddress} />
  //       </ListItem>;
  //     })}
  //   </List>;
  // };

  // addresses.map(({ walletAddress, votes }, index) => {
  //   if (index > 0 && votes < addresses[index - 1].votes) placement++;

  //   return (
  //     <div className={styles.row} key={index}>
  //       <div
  //         className={styles.addressContainer}
  //         onClick={() => clipboard(walletAddress)}
  //       >
  //         <EmojiEventsIcon
  //           fontSize="large"
  //           sx={{
  //             color: trophyColors[placement - 1],
  //             opacity: placement <= 3 ? 1 : 0,
  //           }}
  //         />
  //         <h1 className={styles.address}>{ellipsize(walletAddress)+' | Votes: '+votes}</h1>
  //       </div>
  //     </div>
  //   );
  // });<div className={styles.container}>{rows}</div>
  //{/* <ListItemText><h1 className={styles.address}>{ellipsize(walletAddress, 30)}</h1></ListItemText>  */}
  //<ListItemText>{votes}</ListItemText>
  //
  //
  //
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
            <h1 className={styles.dialogtitle}>Voting Leaderboards</h1>
            <hr style={{borderWidth:2}}/>
          </DialogTitle>
          <List sx={{ pt: 0 }}>
            <ListItem>
              <ListItemText>
                <div className={styles.wrapper}>
                  <div className={styles.addresscolumnheader}>{"Address"}</div>
                  <div className={styles.votecolumnheader}>{"Votes"}</div>
                </div>
              </ListItemText>
            </ListItem>
            {addresses.splice(0,7).map(({ walletAddress, votes }, index) => (
              <ListItem
                key={walletAddress}
                onClick={() => clipboard(walletAddress)}
              >
                <ListItemAvatar >
                  <EmojiEventsIcon
                    fontSize='inherit'
                    sx={{
                      color: trophyColors[index],
                      opacity: index < 3 ? 1 : 0,
                      marginBottom: '20px',
                      fontSize: '26px'

                    }}
                  />
                </ListItemAvatar>
                <ListItemText>
                  <div className={styles.wrapper}>
                    <div className={styles.address}>
                      { ellipsize(walletAddress, 30)}
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
              className={styles.dialogbutton}
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
