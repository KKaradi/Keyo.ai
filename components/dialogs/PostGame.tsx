import type { NextPage } from "next/types";
import styles from "../../styles/components/dialogs/PostGame.module.css";

import { Dispatch, SetStateAction } from "react";
import Dialog from "@mui/material/Dialog";
import SlideTransition from "./SlideTransition";

import DialogContent from "@mui/material/DialogContent";

type PostGameProps = {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  usingWallet: boolean;
};

const PostGame: NextPage<PostGameProps> = ({ openState, usingWallet }) => {
  const [isOpen, setIsOpen] = openState;
  return (
    <Dialog
      open={isOpen}
      TransitionComponent={SlideTransition}
      keepMounted
      onClose={() => setIsOpen(false)}
    >
      <DialogContent sx={{ textAlign: "center" }}>
        <h2>The Game You Were Playing Just Ended</h2>
        <hr className={styles.rule} />
        <p>
          Our image prompts change every 25 hours and the previous game just
          ended.{" "}
          {usingWallet ? (
            <>
              This means you <b>won&apos;t</b> be eligible to purchase this
              game&apos;s <b>NFT</b>
            </>
          ) : (
            <></>
          )}
          <br />
          You may continue playing or <b>refresh</b> the page for the next game.
        </p>
        <div>
          <div className={styles.button} onClick={() => setIsOpen(false)}>
            Continue Game
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostGame;
