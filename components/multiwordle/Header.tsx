import ToolTip from "../misc/ToolTip";
import { NextPage } from "next";
import MoreInfo from "./MoreInfoDialogue";
import QuestionMarkIcon from "@mui/icons-material/QuestionMarkRounded";
import KeyIcon from "@mui/icons-material/Key";
import styles from "../../styles/components/multiwordle/Header.module.css";

const Header: NextPage = () => (
  <div className={styles.header}>
    <div className={styles.moreInfoIcon}>
      <MoreInfo>
        <ToolTip title="How To Play">
          <QuestionMarkIcon className={styles.info} sx={{ fontSize: "%30" }} />
        </ToolTip>
      </MoreInfo>
    </div>

    <div className={styles.title}>Keyo&apos;s Drawdle</div>
    <KeyIcon
      className={styles.keyIcon}
      sx={{ fontSize: "3.5rem", color: "yellow" }}
    />
  </div>
);

export default Header;
