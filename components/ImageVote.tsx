import { NextPage } from "next";
import styles from "../styles/components/ImageVote.module.css";
import { useAccount } from "wagmi";
import ErrorDialog from "./dialogs/ErrorDialog";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { post, getDayIndex } from "../helpers";
import ImageChoice from "./ImageChoice";
import Button from "@mui/material/Button";
import type { Response } from "../pages/api/post/vote";
import TwitterShare from "./TwitterShare";
import ShareIcon from "@mui/icons-material/Share";
import imageData from "../public/choice/data.json";

export type ChoiceCount = Response["choiceCount"];

const connectMessage = "Connect your wallet before voting!";
const reloadMessage = "You are out of date! Please reload the page.";

const START_DATE = process.env.START_DATE;
if (!START_DATE) throw new Error("START_DATE env var not present");

type ImageVoteProps = {
  imageIndexState: [number, Dispatch<SetStateAction<number>>];
  incrementChoicesMade?: () => void;
};

const ImageVote: NextPage<ImageVoteProps> = ({
  incrementChoicesMade,
  imageIndexState,
}) => {
  const [dayIndex, setDayIndex] = useState<number | undefined>();
  const [imageSetIndex, setImageSetIndex] = imageIndexState;
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

  const images = [1, 2].map((index) => {
    if (dayIndex && imageSetIndex > imageData[dayIndex - 1]?.length)
      return <div key={index} />;

    return (
      <ImageChoice
        choiceCount={choiceCount}
        index={index}
        onSubmit={onSubmit}
        path={`/choice/${dayIndex}/${imageSetIndex}/${index}.jpg`}
        key={index}
      />
    );
  });

  const continueButton = choiceCount ? (
    <div className={styles.continueButtonContainer}>
      <Button variant="contained" size="large" onClick={() => nextImageSet()}>
        CONTINUE
      </Button>
      <TwitterShare
        text={dayIndex ? imageData[dayIndex - 1][imageSetIndex - 1] : ""}
      >
        <ShareIcon sx={{ color: "white" }} />
      </TwitterShare>
    </div>
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

      {continueButton}
    </div>
  );
};

export default ImageVote;
