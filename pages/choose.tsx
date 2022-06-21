import type { NextPage } from "next";
import Head from "next/head";
import path from "path";
import ImageWheel from "../components/ImageWheel";
import Header from "../components/Header";
import styles from "../styles/Choose.module.css";

const imagePaths = Array.from(Array(5).keys()).map((num) =>
  path.join(__dirname, `/hints/${num + 1}.jpg`)
);

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
          <ImageWheel paths={imagePaths} />
        </div>
      </main>
    </div>
  );
};

export default GamePage;
