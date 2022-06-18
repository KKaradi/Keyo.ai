import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Non Fungible AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Non Fungible AI</h1>
      </main>

      <footer className={styles.footer}>Developed by Los Maqs</footer>
    </div>
  );
};

export default Home;
