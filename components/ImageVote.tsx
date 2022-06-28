import { NextPage } from "next";
import styles from "../styles/components/ImageVote.module.css";
import { useAccount } from "wagmi";
import ErrorDialog from "./dialogs/ErrorDialog";
import { useEffect, useState } from "react";
import { post, getDayIndex } from "../helpers";
import ImageChoice from "./ImageChoice";
import Button from "@mui/material/Button";
import type { Response } from "../pages/api/post/vote";

export type ChoiceCount = Response["choiceCount"];

const connectMessage = "Connect your wallet before voting!";
const reloadMessage = "You are out of date! Please reload the page.";

const START_DATE = process.env.START_DATE;
if (!START_DATE) throw new Error("START_DATE env var not present");

type ImageVoteProps = {
  endVote: () => void;
  incrementChoicesMade?: () => void;
};

const ImageVote: NextPage<ImageVoteProps> = ({
  incrementChoicesMade,
  endVote,
}) => {
  const [dayIndex, setDayIndex] = useState<number | undefined>();
  const [imageSetIndex, setImageSetIndex] = useState(1);
  const [choiceCount, setChoiceCount] = useState<ChoiceCount | undefined>();

  useEffect(() => setDayIndex(getDayIndex()), []);

  const [connectDialogIsOpen, setConnectDialogIsOpen] = useState(false);
  const [reloadDialogIsOpen, setReloadDialogIsOpen] = useState(false);

  const walletAddress = useAccount().data?.address;

  useEffect(() => {
    if (!walletAddress) setChoiceCount(undefined);
  }, [walletAddress]);

  const onSubmit = async (choiceIndex: number) => {
    if (!walletAddress) return setConnectDialogIsOpen(true);

    const body = { choiceIndex, imageSetIndex, dayIndex, walletAddress };
    const response = await post("/api/post/vote", body);

    if (response.status == 461) setReloadDialogIsOpen(true);

    if (response.status == 200) {
      const { choiceCount: count } = (await response.json()) as Response;
      if (count) setChoiceCount(count);

      if (incrementChoicesMade) incrementChoicesMade();
    }
  };

  const nextImageSet = () => {
    setImageSetIndex(imageSetIndex + 1);
    setChoiceCount(undefined);
  };

  const images = [1, 2].map((index) => (
    <ImageChoice
      choiceCount={choiceCount}
      index={index}
      onSubmit={onSubmit}
      path={`/choice/${dayIndex}/${imageSetIndex}/${index}.jpg`}
      endVote={endVote}
      key={index}
    />
  ));

  const continueButton = choiceCount ? (
    <Button variant="contained" size="large" onClick={() => nextImageSet()}>
      CONTINUE
    </Button>
  ) : null;

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
      <div className={styles.imageRow}> {images}</div>

      <div className={styles.continueButtonContainer}> {continueButton} </div>
    </div>
  );
};

export default ImageVote;
