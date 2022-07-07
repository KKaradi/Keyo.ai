import { Vote } from "../helpers";
import type { NextPage } from "next/types";
import Image from "next/image";
import styles from "../styles/components/History.module.css";
import ImageDialog from "./dialogs/ImageDialog";
import { ReactElement, useState } from "react";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import ToolTip from "./ToolTip";

type HistoryProps = {
  votes: Vote[];
};

const orderByFrequency = (votes: Vote[]) => {
  const byFreq = votes.reduce((prev, curr) => {
    prev[curr.chosen] = (prev[curr.chosen] ?? 0) + 1;
    return prev;
  }, {} as { [key: string]: number });

  votes.forEach((vote) => {
    byFreq[vote.denied] = byFreq[vote.denied] ?? 0;
  });

  return Object.entries(byFreq).sort((a, b) => b[1] - a[1]);
};

const tooltipify = (child: ReactElement, tooltip: boolean) => {
  return tooltip ? <ToolTip title="View History">{child}</ToolTip> : child;
};

const History: NextPage<HistoryProps> = ({ votes }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [imagesStyle, setImagesStyle] = useState(styles.imagesClosed);
  const [iconStyle, setIconStyle] = useState(styles.iconClosed);

  const toggleHistory = () => {
    if (!historyOpen && votes.length != 0) {
      setImagesStyle(styles.imagesOpen);
      setIconStyle(styles.iconOpen);
      setHistoryOpen(true);
    }
    if (historyOpen) {
      setImagesStyle(styles.imagesClosed);
      setIconStyle(styles.iconClosed);
      setHistoryOpen(false);
    }
  };

  const images = orderByFrequency(votes).map(([image, count], index) => {
    const path = `/choice/${image}.jpg`;
    return (
      <div key={index}>
        <div className={styles.imageContainer}>
          <ImageDialog path={path} imageId={image}>
            <Image src={path} layout="fill" objectFit="cover" />
            <div className={styles.overlay}>
              <h1 className={styles.count}> {count} </h1>
            </div>
          </ImageDialog>
        </div>
      </div>
    );
  });

  return (
    <div className={styles.container}>
      <div className={imagesStyle}>{images}</div>
      {tooltipify(
        <ExpandCircleDownIcon
          onClick={toggleHistory}
          className={iconStyle}
          fontSize="large"
        />,
        !historyOpen
      )}
    </div>
  );
};

export default History;
