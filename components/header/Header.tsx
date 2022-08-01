import ToolTip from "../misc/ToolTip";
import { NextPage } from "next";
import InfoDialog from "../dialogs/InfoDialog";
import styles from "../../styles/components/header/Header.module.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import React, { useState } from "react";
import Login from "./Login";
import { SignIn } from "../../pages";
import { Account } from "../../pages/api/schemas";

type HeaderProps = {
  signIn?: SignIn;
  disconnect?: () => void;
  account?: Account;
};

const guide =
  "https://aicamp.notion.site/Guides-and-Resources-AI-Art-69c1501dd0894a2b82d8d816a4ea302b";

const Header: NextPage<HeaderProps> = ({ signIn, account, disconnect }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [loginAnchor, setLoginAnchor] = useState<null | HTMLElement>(null);

  const onLoginClick = ({ currentTarget }: React.MouseEvent<HTMLElement>) => {
    setLoginAnchor(loginAnchor ? null : currentTarget);
  };

  return (
    <div className={styles.header}>
      <a href={guide} target="_blank" rel="noopener noreferrer">
        <ToolTip title="Learn">
          <MenuBookIcon fontSize="large" />
        </ToolTip>
      </a>

      <InfoDialog isOpen={infoOpen} setIsOpen={setInfoOpen}>
        <ToolTip title="How To Play">
          <InfoIcon fontSize="large" />
        </ToolTip>
      </InfoDialog>

      <div onClick={onLoginClick}>
        <ToolTip title="My Profile" placement={loginAnchor ? "top" : undefined}>
          <AccountCircleIcon fontSize="large" />
        </ToolTip>
      </div>

      <Login
        signIn={signIn}
        anchorState={[loginAnchor, setLoginAnchor]}
        account={account}
        disconnect={disconnect}
      />
    </div>
  );
};

export default Header;
