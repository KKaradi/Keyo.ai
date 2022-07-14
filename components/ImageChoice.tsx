import { Button } from "@mui/material";
import { NextPage } from "next/types";
import Image from "next/image";
import { ChoiceCount } from "./ImageVote";
import styles from "../styles/components/ImageChoice.module.css";
import { Dispatch, ReactElement, SetStateAction, useRef } from "react";
import AnimatedPercentage from "./AnimatedPercentage";
import TinderCard from "react-tinder-card";

type ImageChoiceProps = {
  imageId: string;
  index: number;
  onSubmit: (chosen: string) => void;
  choiceCount: ChoiceCount | undefined;
  tinderState: [boolean, Dispatch<SetStateAction<boolean>>];
  isMobile: boolean;
};

const ImageChoice: NextPage<ImageChoiceProps> = ({
  imageId,
  index,
  onSubmit,
  choiceCount,
  tinderState,
  isMobile,
}) => {
  const [isTinder, setIsTinder] = tinderState;

  let percentageText = null;
  if (choiceCount) {
    const count = choiceCount[imageId] ?? 0;
    const sum = Object.values(choiceCount).reduce((prev, curr) => prev + curr);
    const percentage = Number(((count / sum) * 100).toFixed(0));
    percentageText = <AnimatedPercentage endValue={percentage} />;
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
      key={index}
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
      )}
    </div>
  );
};

export default ImageChoice;
