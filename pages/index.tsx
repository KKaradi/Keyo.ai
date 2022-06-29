import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import { get } from "../helpers";
import styles from "../styles/pages/Choose.module.css";
import type { Response } from "./api/get/wallet/[walletAddress]";

const GamePage: NextPage = () => {
  const [choicesMade, setChoicesMade] = useState(0);
  const [isVoting, setIsVoting] = useState(true);
  const [imageSetIndex, setImageSetIndex] = useState(1);

  const { data } = useAccount();

  useEffect(() => {
    (async () => {
      if (!data?.address) return setChoicesMade(0);

      const { address } = data;
      const result = await get(`/api/get/wallet/${address}`);

      const { votes } = (await result.json()) as Response;
      if (votes) {
        setChoicesMade(votes.length);
        if (votes.length > 0) {
          setImageSetIndex(votes[0]?.imageSetIndex + 1);
        }
      }
    })();
  }, [data]);

  useEffect(() => {
    if (imageSetIndex > Number(process.env.IMAGESETS_PER_DAY)) {
      setIsVoting(false);
    }
  }, [imageSetIndex]);

  const incrementChoicesMade = () => setChoicesMade(choicesMade + 1);

  const content = isVoting ? (
    <ImageVote
      imageIndexState={[imageSetIndex, setImageSetIndex]}
      incrementChoicesMade={incrementChoicesMade}
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

      <Header votes={choicesMade} />

      <main className={styles.main}> {content} </main>
    </div>
  );
};

export default GamePage;
