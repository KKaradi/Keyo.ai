import { Vote } from "../pages/index";
import type { NextPage } from "next/types";
import Image from "next/image";
import styles from "../styles/components/History.module.css";
import ImageDialog from "./dialogs/ImageDialog";

type HistoryProps = {
  votes: Vote[];
};

const History: NextPage<HistoryProps> = ({ votes }) => {
  return (
    <div className={styles.container}>
      {votes.map(({ dayIndex, imageSetIndex, choiceIndex }, index) => {
        const path = `/choice/${dayIndex}/${imageSetIndex}/${choiceIndex}.jpg`;
        return (
          <div className={styles.imageContainer} key={index}>
            <ImageDialog path={path}>
              <Image src={path} layout="fill" objectFit="cover" />
            </ImageDialog>
          </div>
        );
      })}
    </div>
  );
};

export default History;
