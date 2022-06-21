import { NextPage } from "next";
import styles from "../styles/Header.module.css";

type HeaderProps = {};

const Header: NextPage<HeaderProps> = () => {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>NON FUNGIBLE AI</h1>
      <ul className={styles.navBar}>
        <li>
          <button className={styles.button}> CONNECT WALLET </button>
        </li>
      </ul>
    </header>
  );
};

export default Header;
