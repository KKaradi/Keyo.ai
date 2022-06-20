import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useLayoutEffect } from "react";
import Wordle from "../components/Wordle/Wordle";
import { colors } from "../constants/colors";
import styles from "../styles/Home.module.css";

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
        <Wordle word={"HELLO"} rowAmount={5} />
      </main>
    </div>
  );
};

export default Home;
