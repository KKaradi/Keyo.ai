import { Button } from "@mui/material";
import { NextPage } from "next/types";
import Image from "next/image";
import { ChoiceCount } from "./ImageVote";
import styles from "../styles/components/ImageChoice.module.css";
import { useScroll } from "../helpers";

type ImageChoiceProps = {
  path: string;
  index: number;
  onSubmit: (index: number) => void;
  choiceCount: ChoiceCount | undefined;
};

const ImageChoice: NextPage<ImageChoiceProps> = ({
  path,
  index,
  onSubmit,
  choiceCount,
}) => {
  let percentage = null;
  if (choiceCount) {
    const count = choiceCount[index] ?? 0;
    const sum = Object.values(choiceCount).reduce((prev, curr) => prev + curr);
    percentage = `${((count / sum) * 100).toFixed(0)}%`;
  }

  const [executeScroll, scrollRef] = useScroll();

  return (
    <div
      key={index}
      className={styles.imageContainer}
      tabIndex={percentage ? undefined : -1}
      ref={scrollRef}
      onClick={executeScroll}
    >
      <div className={styles.imageEffects}>
        <Image
          className={styles.image}
          layout="fill"
          objectFit="cover"
          src={path}
          alt={`Image Choice ${index}`}
        />
        <div className={styles.overlay}>
          <div> </div>
          <h1 className={styles.percentage}> {percentage} </h1>
          <Button
            onClick={() => onSubmit(index)}
            className={styles.submitButton}
            variant="contained"
            size="large"
          >
            SUBMIT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageChoice;
