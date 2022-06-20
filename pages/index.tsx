import type { NextPage } from "next";
import Head from "next/head";
import path from "path";
import { useEffect } from "react";
import ImageCarousel from "../components/ImageCarousel";
import Wordle from "../components/Wordle/Wordle";
import { colors } from "../constants/colors";
import styles from "../styles/Home.module.css";

const imagePaths = Array.from(Array(5).keys()).map((num) =>
  path.join(__dirname, `/hints/${num + 1}.jpg`)
);

const word = "FRENCHMANWITHBAGUETTE";

const Home: NextPage = () => {
  useEffect(() => {
    document.body.style.backgroundColor = colors.background;
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>WORDLE CLONE</title>
        <link rel="icon" href="/icon.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>WORDLE CLONE</h1>
        <ImageCarousel paths={imagePaths} />
        <Wordle word={word.toUpperCase()} rowAmount={5} />
      </main>
    </div>
  );
};

export default Home;
