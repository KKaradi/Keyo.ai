import type { NextPage, NextPageContext } from "next";
import Image from "next/image";
import { post, get } from "../helpers";
import { DefinedGameMove } from "./api/post/multiwordle";
import styles from "../styles/pages/MultiWordle.module.css";
import InputField from "../components/multiwordle/InputField";
import ImageFrame from '../components/multiwordle/ImageFrame';
const MultiWordlePage: NextPage<{ initalGameState: DefinedGameMove }> = ({
  initalGameState: json,
}) => {
  console.log(json);
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div className={styles.halfDiv}>
        <ImageFrame path ="/prototypes/multiwordle/a_paintball_war_vivid_colors_concept_art_trending_on_artstation.png"></ImageFrame>
        <InputField input="a,night,time,cityscape,of,tokyo,harbor,chillwave,style,trending,on,artstation" />
      </div>
    </div>
  );
};

//Tokyo harbor
export const getServerSideProps = async (context: NextPageContext) => {
  const res = await post("http://localhost:3000/api/post/multiwordle", {
    gameStatus: "new",
  });
  const json = await res.json();
  return { props: { json } };
};
export default MultiWordlePage;
