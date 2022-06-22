import { NextPage } from "next";
import styles from "../styles/components/Header.module.css";
import InfoIcon from "@mui/icons-material/Info";
import TwitterIcon from "@mui/icons-material/Twitter";

type HeaderProps = {};

const Header: NextPage<HeaderProps> = () => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>NON FUNGIBLE AI</h1>
      <div className={styles.iconContainer}>
        <InfoIcon
          className={styles.info}
          sx={{ color: "white", fontSize: 40 }}
        />
        <TwitterIcon
          className={styles.info}
          sx={{ color: "white", fontSize: 40 }}
        />
      </div>
    </header>
  );
};

export default Header;
