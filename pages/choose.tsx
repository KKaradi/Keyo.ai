import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import ImageVote from "../components/ImageVote";
import styles from "../styles/pages/Choose.module.css";

const imagePaths = ["/hints/1.jpg", "/hints/2.jpg"] as [string, string];

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
          <ImageVote paths={imagePaths} />
        </div>
      </main>
    </div>
  );
};

export default GamePage;
