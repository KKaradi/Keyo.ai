import type { NextPage } from "next/types";
import Link from "next/link";
import styles from "../styles/components/TwitterShare.module.css";

type TwitterShareProps = {
  text: string;
};

const TwitterShare: NextPage<TwitterShareProps> = ({ text }) => {
  return (
    <div className={styles.container}>
      <Link href="https://twitter.com/share?ref_src=twsrc%5Etfw">
        <a
          target="_blank"
          className={`${styles.text} twitter-share-button`}
          data-text={text}
          data-show-count="false"
        >
          Tweet
        </a>
      </Link>
    </div>
  );
};

export default TwitterShare;
