import type { NextPage } from "next";
import Head from "next/head";
import path from "path";
import { useEffect } from "react";
import Header from "../components/Header";
import ImageCarousel from "../components/ImageCarousel";
import Wordles from "../components/Wordle/Wordles";
import styles from "../styles/Game.module.css";

const imagePaths = Array.from(Array(5).keys()).map((num) =>
  path.join(__dirname, `/hints/${num + 1}.jpg`)
);

const prompt = "FRENCH MAN WITH BAGUETTE";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>WORDLE CLONE</title>
        <link rel="icon" href="/icon.png" />
      </Head>

      <main className={styles.main}>
        <Header />
        <ImageCarousel paths={imagePaths} />
        <Wordles prompt={prompt} maxAttempts={undefined} />
      </main>
    </div>
  );
};

export default Home;
