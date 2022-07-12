import type { NextPage } from "next/types";
import Link from "next/link";
import styles from "../../styles/components/TwitterShare.module.css";
import { ReactElement } from "react";

type TwitterShareProps = {
  children: ReactElement;
  text: string;
};

const TwitterShare: NextPage<TwitterShareProps> = ({ children, text }) => {
  return (
    <div className={styles.container}>
      <Link href={`https://twitter.com/intent/tweet?text=${text}`}>
        <a target="_blank" className={`twitter-share-button`}>
          {children}
        </a>
      </Link>
    </div>
  );
};

export default TwitterShare;
