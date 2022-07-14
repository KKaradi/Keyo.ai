import { NextPage } from "next";
import styles from "../../styles/components/header/Header.module.css";
import InfoIcon from "@mui/icons-material/Info";
import TwitterIcon from "@mui/icons-material/Twitter";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import Link from "next/link";
import InfoDialog from "../dialogs/InfoDialog";
import ConnectWallet from "../wallet/ConnectWallet";
import LeaderboardDialog from "../dialogs/LeaderboardDialog";
import ToolTip from "./ToolTip";
import { Vote } from "../../helpers";

type HeaderProps = { votes?: Vote[] };

const Header: NextPage<HeaderProps> = ({ votes }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>NON FUNGIBLE AI</h1>
      <ConnectWallet />
      <div className={styles.iconsContainer}>
        {votes !== undefined ? (
          <ToolTip title="My Votes">
            <h1 className={styles.votes}> {votes.length} </h1>
          </ToolTip>
        ) : null}
        <LeaderboardDialog>
          <ToolTip title="Voting Leaderboard">
            <LeaderboardIcon className={styles.info} sx={{ fontSize: 40 }} />
          </ToolTip>
        </LeaderboardDialog>
        <InfoDialog>
          <ToolTip title="More Info">
            <InfoIcon className={styles.info} sx={{ fontSize: 40 }} />
          </ToolTip>
        </InfoDialog>
        <Link href={"https://twitter.com/nonfungedai"}>
          <a target="_blank">
            <ToolTip title="Our Twitter">
              <TwitterIcon className={styles.twitter} sx={{ fontSize: 40 }} />
            </ToolTip>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Header;
