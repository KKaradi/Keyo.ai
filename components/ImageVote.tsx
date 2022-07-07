import { NextPage } from "next";
import styles from "../styles/components/ImageVote.module.css";
import { useAccount } from "wagmi";
import ErrorDialog from "./dialogs/ErrorDialog";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Vote, post, getDay, useScroll } from "../helpers";
import ImageChoice from "./ImageChoice";
import Button from "@mui/material/Button";
import type { Response } from "../pages/api/post/vote";
import SETTINGS from "../settings.json";

export type ChoiceCount = Response["choiceCount"];

const connectMessage = "Connect your wallet before voting!";
const reloadMessage = "You are out of date! Please reload the page.";

const START_DATE = process.env.START_DATE;
if (!START_DATE) throw new Error("START_DATE env var not present");

type ImageVoteProps = {
  imageIndexState: [number, Dispatch<SetStateAction<number>>];
  addVote?: (vote: Vote) => void;
  setIsVoting: (value: boolean) => void;
};

const ImageVote: NextPage<ImageVoteProps> = ({
  addVote,
  imageIndexState,
  setIsVoting,
}) => {
  const [day, setDay] = useState<number | undefined>();
  const [imageset, setImageset] = imageIndexState;
  const [choiceCount, setChoiceCount] = useState<ChoiceCount | undefined>();

  useEffect(() => setDay(getDay()), []);

  const [connectDialogIsOpen, setConnectDialogIsOpen] = useState(false);
  const [reloadDialogIsOpen, setReloadDialogIsOpen] = useState(false);

  const walletAddress = useAccount().data?.address;

  useEffect(() => {
    if (!walletAddress) setChoiceCount(undefined);
  }, [walletAddress]);

  const onSubmit = async (chosen: string) => {
    if (!walletAddress) return setConnectDialogIsOpen(true);
    if (!day) return;

    const ids = SETTINGS.schedule[day - 1][imageset - 1];

    const denied = ids[1 - ids.indexOf(chosen)];

    const body = { imageset, day, walletAddress, chosen, denied };
    const response = await post<Vote>("/api/post/vote", body);

    if (response.status == 461) setReloadDialogIsOpen(true);

    if (response.status == 200) {
      const { choiceCount: count } = (await response.json()) as Response;
      if (count) setChoiceCount(count);

      if (addVote) addVote(body);
    }
  };

  const nextImageSet = () => {
    setImageset(imageset + 1);
    setChoiceCount(undefined);
  };

  useEffect(() => {
    if (day && imageset > SETTINGS.schedule[day - 1].length) {
      setIsVoting(false);
    }
  }, [imageset]);

  const images = [1, 2].map((index) => {
    const daySchedule = SETTINGS.schedule[(day ?? 0) - 1];
    if (!day || imageset > daySchedule.length) return <div key={index} />;

    const imageId = daySchedule[imageset - 1][index - 1];

    return (
      <ImageChoice
        choiceCount={choiceCount}
        index={index}
        onSubmit={onSubmit}
        imageId={imageId}
        key={index}
      />
    );
  });

  const continueButton = choiceCount ? (
    <div className={styles.continueContainer}>
      <Button variant="contained" size="large" onClick={() => nextImageSet()}>
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
