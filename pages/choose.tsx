import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import styles from "../styles/pages/Choose.module.css";

const getImageFolder = () => {
  const START_DATE = process.env.START_DATE;
  if (!START_DATE) return 1;

  const sinceStart = Date.now() - new Date(START_DATE).getTime();
  return Math.floor(sinceStart / (1000 * 60 * 60 * 24)) + 1;
};

const GamePage: NextPage = () => {
  const imageFolder = getImageFolder();
  const imagePaths = [
    `/hints/${imageFolder}/1.jpg`,
    `/hints/${imageFolder}/2.jpg`,
  ];
  console.log(imagePaths);

  return (
    <div className={styles.container}>
      <Head>
        <title>CHOOSE</title>
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header />

      <main className={styles.main}>
        <div className={styles.wheel}>
          <ImageVote paths={imagePaths as [string, string]} />
        </div>
        <div className={styles.textContainer}>
          <h1> Choose an image. </h1>
          <p>
            Whichever you find most visually appealing, the coolest, the most
            aesthetically pleasing, the most impressive, the weirdest, the most
            detailed. Connecting your wallet would be even better.
          </p>
        </div>
      </main>
    </div>
  );
};

export default GamePage;
