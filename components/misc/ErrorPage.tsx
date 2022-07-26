import type { NextPage } from "next/types";
import styles from "../../styles/components/misc/ErrorPage.module.css";
import ToolTip from "./ToolTip";
import TwitterIcon from "@mui/icons-material/Twitter";
import Link from "next/link";

const ErrorFeature: NextPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.errorBar}>
        <h1 className={styles.h1}>Error</h1>
        <p className={styles.topParagraph}>
          Seem&apos;s like something went wrong on our end.
        </p>
        <p>Try refreshing to start up a new game or try again later.</p>
        <p className={styles.bottomParagraph}>
          If that dosen&apos;t work you can try tweeting at us.
        </p>
        <Link href={"https://twitter.com/intent/tweet?text=@nonfungedai"}>
          <a target="_blank">
            <ToolTip title="Our Twitter">
              <TwitterIcon className={styles.twitter} sx={{ fontSize: 40 }} />
            </ToolTip>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default ErrorFeature;
