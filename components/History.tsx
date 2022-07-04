import { Vote } from "../helpers";
import type { NextPage } from "next/types";
import Image from "next/image";
import styles from "../styles/components/History.module.css";
import ImageDialog from "./dialogs/ImageDialog";

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

const History: NextPage<HistoryProps> = ({ votes }) => {
  return (
    <div className={styles.container}>
      {orderByFrequency(votes).map(([image, count], index) => {
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
      })}
    </div>
  );
};

export default History;
