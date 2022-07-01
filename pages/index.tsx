import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import { get } from "../helpers";
import styles from "../styles/pages/Choose.module.css";
import type { Response } from "./api/get/wallet/[walletAddress]";

export type Vote = {
  choiceIndex: number;
  imageSetIndex: number;
  dayIndex: number;
  createdAt?: Date;
  id?: string;
};

const GamePage: NextPage = () => {
  const [voteArray, setVotes] = useState<Vote[] | undefined>();
  const [percentiles, setPercentiles] = useState<number[] | undefined>();
  const [isVoting, setIsVoting] = useState(true);
  const [imageSetIndex, setImageSetIndex] = useState(1);

  const address = useAccount().data?.address;

  useEffect(() => {
    (async () => {
      if (!address) {
        console.log("wallet disconnected");
        setVotes(undefined);
        return setImageSetIndex(1);
      }

      const result = await get(`/api/get/wallet/${address}`);

      const { votes, percentileArray } = (await result.json()) as Response;

      if (!votes || !percentileArray) return;

      setPercentiles(percentileArray);
      setVotes(votes);

      if (votes.length > 0) {
        setImageSetIndex(votes[votes.length - 1]?.imageSetIndex + 1);
      }
    })();
  }, [address]);

  useEffect(() => {
    if (imageSetIndex > Number(process.env.IMAGESETS_PER_DAY)) {
      setIsVoting(false);
    }
  }, [imageSetIndex]);

  const addVote = (vote: Vote) => {
    if (voteArray) setVotes([...voteArray, vote]);
  };

  const content = isVoting ? (
    <ImageVote
      imageIndexState={[imageSetIndex, setImageSetIndex]}
      addVote={addVote}
    />
  ) : (
    <h1 className={styles.endText}> THAT'S ALL FOLKS</h1>
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>CHOOSE</title>
        <link rel="icon" href="/icon.jpeg" />
      </Head>

      <Header votes={voteArray} percentiles={percentiles} addVote={addVote} />

      <main className={styles.main}> {content} </main>
    </div>
  );
};

export default GamePage;
