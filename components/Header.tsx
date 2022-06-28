import { NextPage } from "next";
import styles from "../styles/components/Header.module.css";
import InfoIcon from "@mui/icons-material/Info";
import TwitterIcon from "@mui/icons-material/Twitter";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import Link from "next/link";
import InfoDialog from "./dialogs/InfoDialog";
import ConnectWallet from "./ConnectWallet";
import LeaderboardDialog from "./dialogs/LeaderboardDialog";

type HeaderProps = {
  votes?: number;
};

const Header: NextPage<HeaderProps> = ({ votes }) => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>NON FUNGIBLE AI</h1>
      <div className={styles.iconContainer}>
        <ConnectWallet />

        {votes ? <h1 className={styles.votes}> {votes} </h1> : null}

        <LeaderboardDialog>
          <LeaderboardIcon className={styles.info} sx={{ fontSize: 40 }} />
        </LeaderboardDialog>

        <InfoDialog>
          <InfoIcon className={styles.info} sx={{ fontSize: 40 }} />
        </InfoDialog>

        <Link href={"https://twitter.com/nonfungedai"}>
          <a target="_blank">
            <TwitterIcon className={styles.twitter} sx={{ fontSize: 40 }} />
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
