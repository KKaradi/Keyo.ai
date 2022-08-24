import ToolTip from "../misc/ToolTip";
import { NextPage } from "next";
import HowToPlayDialog from "../dialogs/HowToPlayDialog";
import styles from "../../styles/components/header/Header.module.css";
import InfoIcon from "@mui/icons-material/Info";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import React, { Dispatch, SetStateAction, useState } from "react";
import Login from "./Login";
import { SignIn } from "../../pages";
import { Account } from "../../schemas";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";
type HeaderProps = {
  signIn?: SignIn;
  disconnect?: () => Promise<void>;
  account?: Account;
  won: boolean;
  setOpenWinDialog: Dispatch<SetStateAction<boolean>>;
};

const guide =
  "https://aicamp.notion.site/Guides-and-Resources-AI-Art-69c1501dd0894a2b82d8d816a4ea302b";

const Header: NextPage<HeaderProps> = ({
  signIn,
  account,
  disconnect,
  won,
  setOpenWinDialog,
}) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className={styles.header}>
      {won ? (
        <div className={styles.winTab} onClick={() => setOpenWinDialog(true)}>
          <ToolTip title="Win Page">
            <EmojiEventsOutlinedIcon
              color="inherit"
              fontSize="large"
              floodColor={"#ffffff"}
            />
          </ToolTip>
        </div>
      ) : (
        <></>
      )}
      <div className={styles.tab}>
        <a href={guide} target="_blank" rel="noopener noreferrer">
          <ToolTip title="Learn">
            <MenuBookIcon fontSize="large" />
          </ToolTip>
        </a>
      </div>
      <div className={styles.tab}>
        <HowToPlayDialog isOpen={infoOpen} setIsOpen={setInfoOpen}>
          <ToolTip title="How To Play">
            <InfoIcon fontSize="large" />
          </ToolTip>
        </HowToPlayDialog>
      </div>
      <div className={styles.tab}>
        <Login signIn={signIn} account={account} disconnect={disconnect} />
      </div>
    </div>
  );
};

export default Header;
