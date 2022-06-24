import { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/components/ImageVote.module.css";
import { useAccount } from "wagmi";
import ErrorDialog from "./dialogs/ErrorDialog";
import { useState } from "react";

type ImageVoteProps = {
  paths: [string, string];
};

const connectMessage = "Connect your wallet address before voting!";
const votedMessage = "You already voted today!";

const ImageVote: NextPage<ImageVoteProps> = ({ paths }) => {
  const [connectDialogIsOpen, setConnectDialogIsOpen] = useState(false);
  const [votedDialogIsOpen, setVotedDialogIsOpen] = useState(false);

  const walletAddress = useAccount().data?.address ?? undefined;

  const onClick = async (index: number) => {
    if (!walletAddress) return setConnectDialogIsOpen(true);

    const result = await fetch("/api/post/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index, walletAddress }),
    });

    // 401 status signifies already voted
    if (result.status == 401) setVotedDialogIsOpen(true);
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
      <div className={styles.imageRow}> {images} </div>
    </div>
  );
};

export default ImageVote;
