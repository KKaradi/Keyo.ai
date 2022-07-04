import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import { Vote, get } from "../helpers";
import styles from "../styles/pages/Choose.module.css";
import type { Response } from "./api/get/wallet/[walletAddress]";

const GamePage: NextPage = () => {
  const [voteArray, setVotes] = useState<Vote[] | undefined>();
  const [percentiles, setPercentiles] = useState<number[] | undefined>();
  const [isVoting, setIsVoting] = useState(true);
  const [imageset, setImageset] = useState(1);

  const address = useAccount().data?.address;

  useEffect(() => {
    (async () => {
      if (!address) {
        setIsVoting(true);
        setVotes(undefined);
        return setImageset(1);
      }

      const result = await get(`/api/get/wallet/${address}`);

      const { votes, percentileArray } = (await result.json()) as Response;

      if (!votes || !percentileArray) return;

      setPercentiles(percentileArray);
      setVotes(votes);

      if (votes.length > 0) {
        setImageset(votes[votes.length - 1]?.imageset + 1);
      }
    })();
  }, [address]);

  const addVote = (vote: Vote) => {
    if (voteArray) setVotes([...voteArray, vote]);
  };

  const content = isVoting ? (
    <ImageVote
      imageIndexState={[imageset, setImageset]}
      addVote={addVote}
      setIsVoting={setIsVoting}
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

      <Header votes={voteArray} percentiles={percentiles} />

      <main className={styles.main}> {content} </main>
    </div>
  );
};

export default GamePage;
