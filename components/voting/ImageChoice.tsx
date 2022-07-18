import { Button } from "@mui/material";
import { NextPage } from "next/types";
import Image from "next/image";
import { ChoiceCount, Rankings } from "./ImageVote";
import styles from "../../styles/components/voting/ImageChoice.module.css";
import { Dispatch, ReactElement, SetStateAction, useRef } from "react";
import AnimatedValue from "./AnimatedValue";
import TinderCard from "react-tinder-card";
import ToolTip from "../header/ToolTip";

type ImageChoiceProps = {
  imageId: string;
  index: number;
  onSubmit: (chosen: string) => void;
  choiceCount: ChoiceCount | undefined;
  rankings: Rankings | undefined;
  tinderState: [boolean, Dispatch<SetStateAction<boolean>>];
  isMobile: boolean;
  randomMode: boolean;
};

const ImageChoice: NextPage<ImageChoiceProps> = ({
  imageId,
  index,
  onSubmit,
  rankings,
  choiceCount,
  tinderState,
  isMobile,
  randomMode,
}) => {
  const [isTinder, setIsTinder] = tinderState;

  let stat = null;
  if (randomMode && rankings) {
    const ranking = rankings[imageId] ?? "?";
    stat = (
      <ToolTip title="Image Ranking">
        <h1 className={styles.percentage} style={{ zIndex: 9999 }}>
          Ranked #{ranking}
        </h1>
      </ToolTip>
    );
  } else if (choiceCount) {
    const count = choiceCount[imageId] ?? 0;
    const sum = Object.values(choiceCount).reduce((prev, curr) => prev + curr);
    const percentage = Number(((count / sum) * 100).toFixed(0));
    stat = <AnimatedValue endValue={percentage} suffix={"%"} />;
  }

  const imageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef(null);

  const submitImage = () => {
    if (document.activeElement === buttonRef?.current) onSubmit(imageId);
    else imageRef?.current?.focus();
  };

  const swipe = () => {
    onSubmit(imageId);
    setIsTinder(false);
  };

  const tinderify = (children: ReactElement) => {
    return isMobile && isTinder ? (
      // @ts-ignore
      <TinderCard
        swipeRequirementType="position"
        onSwipe={swipe}
        swipeThreshold={200}
      >
        {children}
      </TinderCard>
    ) : (
      children
    );
  };

  return (
    <div
      className={styles.imageContainer}
      tabIndex={choiceCount ? undefined : -1}
      ref={imageRef}
    >
      {tinderify(
        <div>
          <Image
            className={styles.image}
            layout="fill"
            objectFit="cover"
            src={`/choice/${imageId}.jpg`}
            priority
            alt={`Image Choice ${index}`}
          />
          <div className={styles.overlay}>
            <div> </div>
            <div> {stat} </div>
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
      )}
    </div>
  );
};

export default ImageChoice;
