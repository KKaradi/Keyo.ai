import { NextPage } from "next";
import styles from "../styles/components/Header.module.css";
import InfoIcon from "@mui/icons-material/Info";
import TwitterIcon from "@mui/icons-material/Twitter";
import Button from "@mui/material/Button";
import Link from "next/link";
import InfoDialog from "./InfoDialog";

const Header: NextPage = () => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>NON FUNGIBLE AI</h1>
      <div className={styles.iconContainer}>
        <Button variant="contained"> CONNECT WALLET </Button>

        <InfoDialog>
          <InfoIcon className={styles.info} sx={{ fontSize: 40 }} />
        </InfoDialog>

        <Link href={"https://twitter.com/nonfungedai"}>
          <TwitterIcon className={styles.twitter} sx={{ fontSize: 40 }} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
