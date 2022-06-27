import { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/components/ImageVote.module.css";
import { useAccount } from "wagmi";
import ErrorDialog from "./dialogs/ErrorDialog";
import { useEffect, useState } from "react";
import { request, getImageSetIndex } from "../helpers";

type ImageVoteProps = {
  paths: [string, string];
};

const connectMessage = "Connect your wallet before voting!";
const votedMessage = "You already voted today!";
const reloadMessage = "You are out of date! Please reload the page.";

const START_DATE = process.env.START_DATE;
if (!START_DATE) throw new Error("START_DATE env var not present");

const ImageVote: NextPage<ImageVoteProps> = () => {
  const imageSetState = useState<number | undefined>(undefined);
  const [imageSetIndex, setImageSetIndex] = imageSetState;

  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const folder = getImageSetIndex();
    setImageSetIndex(folder);
    setPaths([1, 2].map((num) => `/choice/${folder}/${num}.jpg`));
  }, []);

  const [connectDialogIsOpen, setConnectDialogIsOpen] = useState(false);
  const [votedDialogIsOpen, setVotedDialogIsOpen] = useState(false);
  const [reloadDialogIsOpen, setReloadDialogIsOpen] = useState(false);

  const walletAddress = useAccount().data?.address ?? undefined;

  const onClick = async (choiceIndex: number) => {
    if (!walletAddress) return setConnectDialogIsOpen(true);

    const body = { choiceIndex, walletAddress, imageSetIndex };
    const result = await request("/api/post/vote", "POST", body);

    // 461 signifies already voted, 462 to reload page
    if (result.status == 461) setVotedDialogIsOpen(true);
    if (result.status == 462) setReloadDialogIsOpen(true);
  };

  const images = paths.map((path, index) => {
    return (
      <div className={styles.imageContainer} key={index}>
        <Image
          className={styles.image}
          layout="fill"
          src={path}
          alt=""
          onClick={() => onClick(index)}
        />
      </div>
    );
  });

  return (
    <div>
      <ErrorDialog
        text={connectMessage}
        isOpen={connectDialogIsOpen}
        setIsOpen={setConnectDialogIsOpen}
      />
      <ErrorDialog
        text={votedMessage}
        isOpen={votedDialogIsOpen}
        setIsOpen={setVotedDialogIsOpen}
      />
      <ErrorDialog
        text={reloadMessage}
        isOpen={reloadDialogIsOpen}
        setIsOpen={setReloadDialogIsOpen}
      />
      <div className={styles.imageRow}> {images} </div>
    </div>
  );
};

export default ImageVote;
