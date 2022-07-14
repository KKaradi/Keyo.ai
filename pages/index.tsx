import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Header from "../components/header/Header";
import ImageVote from "../components/voting/ImageVote";
import { Vote, get, shuffle, getDay } from "../helpers";
import styles from "../styles/pages/Choose.module.css";
import type { Response } from "./api/get/wallet/[walletAddress]";
import History from "../components/header/History";
import Button from "@mui/material/Button";
import SETTINGS from "../settings.json";

const GamePage: NextPage = () => {
  const [voteArray, setVotes] = useState<Vote[] | undefined>();
  const [percentiles, setPercentiles] = useState<number[] | undefined>();
  const [imageset, setImageset] = useState(1);

  const [isVoting, setIsVoting] = useState(true);
  const shuffledSetState = useState<string[][] | undefined>(undefined);
  const [shuffledSets, setShuffledSets] = shuffledSetState;

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

      const day = getDay();

      const filtered = votes.filter((vote: Vote) => {
        return vote.day == day && !vote.random;
      });

      if (filtered.length > 0) {
        setImageset(filtered[filtered.length - 1]?.imageset + 1);
      }
    })();
  }, [address]);

  const addVote = (vote: Vote) => {
    if (voteArray) setVotes([...voteArray, vote]);
  };

  const stopVoting = () => setIsVoting(false);

  const shuffleMode = () => {
    const day = getDay();

    const imageIds = SETTINGS.schedule[day - 1].reduce((prev, curr) => {
      return prev.concat(curr);
    }, []);

    const shuffled = shuffle<string>(imageIds);

    setImageset(1);
    setIsVoting(true);
    setShuffledSets(
      shuffled.reduce((prev, _, index, array) => {
        if (index % 2 == 0) {
          (prev as string[][]).push(array.slice(index, index + 2));
        }
        return prev;
      }, [])
    );
  };

  const content = isVoting ? (
    <ImageVote
      imageIndexState={[imageset, setImageset]}
      addVote={addVote}
      stopVoting={stopVoting}
      shuffledSets={shuffledSets}
    />
  ) : (
    <div className={styles.comeback}>
      <h1 className={styles.endText}> COME BACK TOMORROW FOR MORE... </h1>
      <Button variant="contained" size="large" onClick={shuffleMode}>
        SHUFFLE AND RETRY
      </Button>
    </div>
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Non Fungible AI</title>
        <link rel="icon" href="/icon.jpeg" />
      </Head>

      <div className={styles.header}>
        <Header votes={voteArray} percentiles={percentiles} />
        {voteArray ? <History votes={voteArray} /> : null}
      </div>

      <main className={styles.main}> {content} </main>
    </div>
  );
};

export default GamePage;
