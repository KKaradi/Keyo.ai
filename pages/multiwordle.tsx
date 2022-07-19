import type { NextPage, NextPageContext } from "next";
import Image from "next/image";
import { post, get } from "../helpers";
import { AcceptGameMove, ReturnGameMode } from "./api/post/multiwordle";
import styles from "../styles/pages/MultiWordle.module.css";
import InputField from "../components/multiwordle/InputField";
import ImageFrame from "../components/multiwordle/ImageFrame";
import TextField from "@mui/material/TextField/TextField";
import { ChangeEventHandler, useCallback, useEffect, useState } from "react";

const MultiWordlePage: NextPage<{ initalGameState: ReturnGameMode }> = ({
  initalGameState: gameState,
}) => {
  console.log(gameState)
  const [userInput, setUserInput] = useState("");
  const [newDataFlag, setNewDataFlag] = useState(true);

  const handleUserKeyPress = useCallback(
    (event: { key: string; keyCode: number }) => {
      const { key, keyCode } = event;

      if (keyCode >= 65 && keyCode <= 90) {
        setUserInput((prevUserText) => `${prevUserText}${key}`);
      } else if (keyCode === 8) {
        setUserInput((prevUserText) => prevUserText.slice(0, -1));
      } else if (keyCode === 13) {
        ("");
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  return (
    <div className={styles.body}>
      <div className={styles.half}>
        <ImageFrame path="/prototypes/multiwordle/a_nighttime_cityscape_of_tokyo_harbor_chillwave_style_trending_on_artstation.png"></ImageFrame>
        {/* <input type='textfield' value={input} onChange={handleChange}/> */}
        <InputField input={userInput} gameState={gameState} newDataFlag={newDataFlag} setNewDataFlag={setNewDataFlag}/>
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: NextPageContext) => {
  // const res = await post("http://localhost:3000/api/post/multiwordle", {
  //   gameStatus: "new",
  // });

  const dummyInput = ['a','nighttime','cityscape','of','hanoi','oceans','chillwave','style','trending','on','artstation'];

  const gameStatus: AcceptGameMove = {
    gameId: 1,
    gameStatus: "started",
    summary: dummyInput.map((word) => word.length),
    inputs: [
      { characters: dummyInput[0].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[1].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[2].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[3].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[4].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[5].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[6].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[7].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[8].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[9].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
      { characters: dummyInput[10].split("").map((char)=>{return {character:char, status: undefined}}), completed: false },
    ]
  };

  const res = await post("http://localhost:3000/api/post/multiwordle", gameStatus);

  const initalGameState = await res.json();
  return { props: { initalGameState } };
};
export default MultiWordlePage;
