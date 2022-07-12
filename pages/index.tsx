import type { NextPage } from "next";
import Head from "next/head";
import path from "path";
import Header from "../components/header/Header";
import ImageCarousel from "../components/wordle/ImageCarousel";
import Wordles from "../components/wordle/Wordles";
import prisma from "../lib/prisma";
import styles from "../styles/components/Header.module.css";

const defaultPrompt = "this is a default prompt";

const imagePaths = Array.from(Array(5).keys()).map((num) =>
  path.join(__dirname, `/hints/${num + 1}.jpg`)
);

type HomeProps = {
  prompt: string;
};

const Home: NextPage<HomeProps> = ({ prompt }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>WORDLE CLONE</title>
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header />

      <main className={styles.main}>
        <ImageCarousel paths={imagePaths} />
        <Wordles prompt={prompt} maxAttempts={undefined} />
      </main>
    </div>
  );
};

export async function getServerSideProps() {
  const findPrompt = await prisma.prompt.findFirst();
  if (!findPrompt) console.log("DB Error");

  let prompt = findPrompt?.prompt ?? defaultPrompt;

  // encode prompt to all *
  const arr = prompt.split("");
  for (let idx = 0; idx < prompt.length; idx++) {
    if (prompt.charAt(idx) !== " ") arr[idx] = "*";
  }

  prompt = arr.join("");

  // will pass in as props above in component
  return { props: { prompt } };
}

export default Home;
