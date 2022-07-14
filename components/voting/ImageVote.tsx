import { NextPage } from "next";
import styles from "../../styles/components/voting/ImageVote.module.css";
import { useAccount } from "wagmi";
import ErrorDialog from "../dialogs/ErrorDialog";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Vote, post, getDay, useScroll } from "../../helpers";
import ImageChoice from "./ImageChoice";
import Button from "@mui/material/Button";
import type { ExpectedBody, Response } from "../../pages/api/post/vote";
import SETTINGS from "../../settings.json";
import { useMediaQuery } from "react-responsive";

export type ChoiceCount = Response["choiceCount"];
export type Rankings = Response["rankings"];

const connectMessage = "Connect your wallet before voting!";
const reloadMessage = "You are out of date! Please reload the page.";

type ImageVoteProps = {
  imageIndexState: [number, Dispatch<SetStateAction<number>>];
  stopVoting: () => void;
  addVote?: (vote: Vote) => void;
  shuffledSets?: string[][];
};

const ImageVote: NextPage<ImageVoteProps> = ({
  addVote,
  imageIndexState,
  stopVoting,
  shuffledSets,
}) => {
  const [imageset, setImageset] = imageIndexState;
  const [choiceCount, setChoiceCount] = useState<ChoiceCount | undefined>();
  const [rankings, setRankings] = useState<Rankings | undefined>();

  const isMobile = useMediaQuery({ query: `(max-width: 480px)` });
  const [isTinder, setIsTinder] = useState(isMobile);

  const [connectDialogIsOpen, setConnectDialogIsOpen] = useState(false);
  const [reloadDialogIsOpen, setReloadDialogIsOpen] = useState(false);

  const walletAddress = useAccount().data?.address;

  useEffect(() => {
    if (!walletAddress) {
      setChoiceCount(undefined);
      setRankings(undefined);
    }
  }, [walletAddress]);

  const onSubmit = async (chosen: string) => {
    if (!walletAddress) {
      setIsTinder(true);
      return setConnectDialogIsOpen(true);
    }

    const day = getDay();

    const ids = shuffledSets
      ? shuffledSets[imageset - 1]
      : SETTINGS.schedule[day - 1][imageset - 1];

    const denied = ids[1 - ids.indexOf(chosen)];
    const random = shuffledSets !== undefined;

    const body = { imageset, day, walletAddress, chosen, denied, random };
    const response = await post<ExpectedBody>("/api/post/vote", body);

    if (response.status == 461) {
      setIsTinder(true);
      return setReloadDialogIsOpen(true);
    }

    if (response.status == 200) {
      const { choiceCount: count, rankings } =
        (await response.json()) as Response;

      if (count) setChoiceCount(count);
      if (rankings) setRankings(rankings);

      if (addVote) addVote(body);
    }
  };

  const nextImageSet = () => {
    setImageset(imageset + 1);
    setChoiceCount(undefined);
    setRankings(undefined);
  };

  useEffect(() => {
    const day = getDay();
    if (day && imageset > SETTINGS.schedule[day - 1].length) {
      stopVoting();
    }
  }, [imageset]);

  const images = [1, 2].map((index) => {
    const day = getDay();
    const daySchedule = shuffledSets
      ? shuffledSets
      : SETTINGS.schedule[day - 1];

    if (!day || imageset > daySchedule.length) return <div key={index} />;

    const imageId = daySchedule[imageset - 1][index - 1];

    return (
      <ImageChoice
        choiceCount={choiceCount}
        rankings={rankings}
        randomMode={shuffledSets !== undefined}
        index={index}
        onSubmit={onSubmit}
        imageId={imageId}
        tinderState={[isTinder, setIsTinder]}
        isMobile={isMobile}
        key={index}
      />
    );
  });

  const nextImage = () => {
    setIsTinder(true);
    nextImageSet();
  };

  const continueButton = choiceCount ? (
    <div className={styles.continueContainer}>
      <Button variant="contained" size="large" onClick={nextImage}>
        CONTINUE
      </Button>
    </div>
  ) : null;

  const [executeScroll, scrollRef] = useScroll();

  return (
    <div className={styles.imageRowContainer}>
      <ErrorDialog
        text={connectMessage}
        isOpen={connectDialogIsOpen}
        setIsOpen={setConnectDialogIsOpen}
      />
      <ErrorDialog
        text={reloadMessage}
        isOpen={reloadDialogIsOpen}
        setIsOpen={setReloadDialogIsOpen}
      />
      <div ref={scrollRef} className={styles.imageRow} onClick={executeScroll}>
        {images} {continueButton}
      </div>
    </div>
  );
};

export default ImageVote;
