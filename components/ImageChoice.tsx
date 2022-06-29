import { Button } from "@mui/material";
import { NextPage } from "next/types";
import Image from "next/image";
import { ChoiceCount } from "./ImageVote";
import styles from "../styles/components/ImageChoice.module.css";
import { useScroll } from "../helpers";
import { useRef } from "react";
import AnimatedPercentage from "./AnimatedPercentage";

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
  let percentageText = null;
  if (choiceCount) {
    const count = choiceCount[index] ?? 0;
    const sum = Object.values(choiceCount).reduce((prev, curr) => prev + curr);
    const percentage = Number(((count / sum) * 100).toFixed(0));
    percentageText = <AnimatedPercentage end={percentage} />;
  }

  const [executeScroll, scrollRef] = useScroll();
  const buttonRef = useRef(null);

  if (path.includes("undefined")) return <div />;

  const submitImage = () => {
    if (document.activeElement === buttonRef?.current) onSubmit(index);
    else scrollRef?.current?.focus();
  };

  return (
    <div
      key={index}
      className={styles.imageContainer}
      tabIndex={choiceCount ? undefined : -1}
      ref={scrollRef}
      onClick={executeScroll}
    >
      <Image
        className={styles.image}
        layout="fill"
        objectFit="cover"
        src={path}
        priority
        alt={`Image Choice ${index}`}
      />
      <div className={styles.overlay}>
        <div> </div>
        <div> {percentageText} </div>
        <Button
          onClick={submitImage}
          className={styles.submitButton}
          variant="contained"
          size="large"
          ref={buttonRef}
        >
          SUBMIT
        </Button>
      </div>
    </div>
  );
};

export default ImageChoice;
