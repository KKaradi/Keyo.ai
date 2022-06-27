import { NextPage } from "next";
import styles from "../styles/components/Header.module.css";
import InfoIcon from "@mui/icons-material/Info";
import TwitterIcon from "@mui/icons-material/Twitter";
import Link from "next/link";
import InfoDialog from "./dialogs/InfoDialog";
import ConnectWallet from "./ConnectWallet";
import TwitterShare from "./TwitterShare";

const Header: NextPage = () => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>NON FUNGIBLE AI</h1>
      <div className={styles.iconContainer}>
        <ConnectWallet />
        <TwitterShare text="hi" />
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
