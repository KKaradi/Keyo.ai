import ToolTip from "../misc/ToolTip";
import { NextPage } from "next";
import HowToPlayDialog from "../dialogs/HowToPlayDialog";
import styles from "../../styles/components/header/Header.module.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import React, { useState } from "react";
import Login from "./Login";
import { SignIn } from "../../pages";
import { Account } from "../../schemas";

type HeaderProps = {
  signIn?: SignIn;
  disconnect?: () => Promise<void>;
  account?: Account;
};

const guide =
  "https://aicamp.notion.site/Guides-and-Resources-AI-Art-69c1501dd0894a2b82d8d816a4ea302b";

const Header: NextPage<HeaderProps> = ({ signIn, account, disconnect }) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className={styles.header}>
      <a href={guide} target="_blank" rel="noopener noreferrer">
        <ToolTip title="Learn">
          <MenuBookIcon fontSize="large" />
        </ToolTip>
      </a>

      <HowToPlayDialog isOpen={infoOpen} setIsOpen={setInfoOpen}>
        <ToolTip title="How To Play">
          <InfoIcon fontSize="large" />
        </ToolTip>
      </HowToPlayDialog>

      <Login signIn={signIn} account={account} disconnect={disconnect} />
    </div>
  );
};

export default Header;
