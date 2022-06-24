import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import styles from "../styles/pages/Choose.module.css";

const imagePaths = [`/choice/2/1.jpg`, `/choice/2/2.jpg`];

const GamePage: NextPage = () => {
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
