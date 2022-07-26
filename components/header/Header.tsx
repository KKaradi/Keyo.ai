import ToolTip from "../misc/ToolTip";
import { NextPage } from "next";
import InfoDialog from "../dialogs/InfoDialog";
import styles from "../../styles/components/header/Header.module.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InfoIcon from "@mui/icons-material/Info";
import { useState } from "react";

const Header: NextPage = () => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className={styles.header}>
      <InfoDialog isOpen={infoOpen} setIsOpen={setInfoOpen}>
        <ToolTip title="How To Play">
          <InfoIcon fontSize="large" />
        </ToolTip>
      </InfoDialog>
      <ToolTip title="My Profile">
        <AccountCircleIcon fontSize="large" />
      </ToolTip>
    </div>
  );
};

export default Header;
