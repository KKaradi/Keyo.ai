import type { NextPage } from "next/types";

import styles from "../../styles/components/misc/PostGame.module.css";
import WarningIcon from "@mui/icons-material/Warning";
import { Dispatch, SetStateAction } from "react";

const PostGame: NextPage = () => {
  return (
    <div className={styles.div}>
      <div className={styles.text}>
        You&apos;re playing yesterday&apos;s game. <br />
        <div className={styles.smallText}>
          (You won&apos;t be able to win any rewards)
        </div>
      </div>
      <div className={styles.button} onClick={() => window.location.reload()}>
        Click for next game
      </div>
    </div>
  );
};

export default PostGame;
