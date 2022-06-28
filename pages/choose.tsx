import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import { get } from "../helpers";
import styles from "../styles/pages/Choose.module.css";

const GamePage: NextPage = () => {
  const [choicesMade, setChoicesMade] = useState(0);
  const [isVoting, setIsVoting] = useState(true);

  const { data } = useAccount();

  useEffect(() => {
    (async () => {
      if (!data?.address) return setChoicesMade(0);
      const { address } = data;
      const result = await get(`/api/get/votes/${address}`);
      const { votes } = await result.json();
      if (votes) setChoicesMade(votes.length);
    })();
  }, [data]);

  const incrementChoicesMade = () => setChoicesMade(choicesMade + 1);

  return (
    <div className={styles.container}>
      <Head>
        <title>CHOOSE</title>
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header />

      <main className={styles.main}>
        {isVoting ? (
          <ImageVote
            endVote={() => setIsVoting(false)}
            incrementChoicesMade={incrementChoicesMade}
          />
        ) : (
          <h1 className={styles.endText}> THAT'S ALL FOLKS</h1>
        )}
      </main>
    </div>
  );
};

export default GamePage;
