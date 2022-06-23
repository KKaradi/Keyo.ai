import { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/components/ImageVote.module.css";
import { useAccount } from "wagmi";

type ImageVoteProps = {
  paths: [string, string];
};

const ImageVote: NextPage<ImageVoteProps> = ({ paths }) => {
  const walletAddress = useAccount().data?.address ?? undefined;

  const onClick = async (index: number) => {
    if (!walletAddress) return;

    await fetch("/api/post/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index, walletAddress }),
    });
  };

  const images = paths.map((path, index) => (
    <div className={styles.imageContainer} key={index}>
      <Image
        className={styles.image}
        layout="fill"
        src={path}
        alt=""
        onClick={() => onClick(index)}
      />
    </div>
  ));

  return <div className={styles.imageRow}> {images} </div>;
};

export default ImageVote;
