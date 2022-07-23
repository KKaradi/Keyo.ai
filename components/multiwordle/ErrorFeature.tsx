import type { NextPage } from "next/types";
import styles from "../../styles/components/multiwordle/ErrorFeature.module.css";
import ToolTip from "../misc/ToolTip";
import TwitterIcon from "@mui/icons-material/Twitter";
import Link from "next/link";

type ErrorProps = {
  error: boolean;
  children: React.ReactNode;
};

const ErrorFeature: NextPage<ErrorProps> = ({ error, children }) => {
  if (error) {
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
  } else {
    return <div>{children}</div>;
  }
};

export default ErrorFeature;
