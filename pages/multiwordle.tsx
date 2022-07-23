import type { NextPage, NextPageContext } from "next";
import { post } from "../helpers";
import {
  AcceptGameMove,
  GameStatus,
  ReturnCharacter,
  ReturnGameMode,
  ReturnWord,
} from "./api/post/multiwordle";
import styles from "../styles/pages/MultiWordle.module.css";
import InputField from "../components/multiwordle/InputField";
import ImageFrame from "../components/multiwordle/ImageFrame";
import { useState } from "react";
import Carousel from "../components/multiwordle/Carousel";
import Keyboard from "../components/multiwordle/Keyboard";
import ErrorFeature from "../components/multiwordle/ErrorFeature";
import Header from "../components/multiwordle/Header";

function getNewInputs(input: string, gameState: ReturnGameMode): ReturnWord[] {
  if (gameState.inputs === undefined) {
    return [];
  }
  return gameState.inputs.map((word) => {
    if (word.completed) return word;
    return {
      completed: false,
      characters: word.characters.map(({ status }, index) => {
        const charAt = input.charAt(index);
        return {
          character: charAt === "" ? " " : charAt,
          status,
        };
      }),
    } as ReturnWord;
  });
}

function gameStackToSlides(
  gameStates: ReturnGameMode[]
): ReturnCharacter[][][] {
  const slides: ReturnCharacter[][][] = [];

  gameStates.forEach((gameState, gameStateIndex) => {
    if (gameState.inputs === undefined) return;
    if (gameStateIndex === gameStates.length - 1) return;
    gameState.inputs.forEach((input, inputIndex) => {
      if (!slides[inputIndex]) slides.push([]);
      if (!slides[inputIndex][gameStateIndex]) slides[inputIndex].push([]);

      let { characters } = input;

      if (gameStateIndex === 0) {
        characters = characters.map(({ character }) => {
          return { status: "empty", character };
        });
      }

      slides[inputIndex][gameStateIndex].push(...characters);
    });
  });
  return slides;
}

const MultiWordlePage: NextPage<{
  initalGameState: ReturnGameMode;
}> = ({ initalGameState: initalGameState }) => {
  const [gameStateStack, setGameStateStack] = useState<ReturnGameMode[]>([
    initalGameState,
  ]);
  const [gameState, setGameState] = useState(initalGameState);
  const [newDataFlag, setNewDataFlag] = useState(true);

  const onPress = (userInput: string) => {
    const inputs = getNewInputs(userInput, gameState);
    setNewDataFlag(userInput === "");
    setGameState({ ...gameState, inputs });
  };

  const onSubmit = async () => {
    const res = await post<ReturnGameMode>(
      "api/post/multiwordle",
      gameState as ReturnGameMode
    );
    const json = await res.json();
    setNewDataFlag(true);
    setGameStateStack([json, ...gameStateStack]);
    setGameState(json);
  };
  return (
    <ErrorFeature error={gameState.error}>
      <div className={styles.container}>
        <div className={styles.left}>
          {gameState.imagePath === undefined ? (
            <div>Failed To Load</div>
          ) : (
            <ImageFrame path={gameState.imagePath}></ImageFrame>
          )}
          <InputField
            gameState={gameState}
            previousGameState={gameStateStack[0]}
            newDataFlag={newDataFlag}
          />
        </div>
        <div className={styles.right}>
          <Carousel
            slides={gameStackToSlides([gameState, ...gameStateStack])}
          />
          <Keyboard onPress={onPress} onSubmit={onSubmit} />
        </div>
        <Header />
      </div>
    </ErrorFeature>
  );
};

export const getServerSideProps = async ({ req }: NextPageContext) => {
  const url = new URL(
    "api/post/multiwordle",
    `http://${req?.headers.host}`
  ).toString();

  const gameState = {
    gameStatus: "new" as GameStatus,
    imagePath: undefined,
    gameId: undefined,
    summary: undefined,
    inputs: undefined,
  };

  const res = await post<AcceptGameMove>(url, gameState);

  const initalGameState = await res.json();

  return { props: { initalGameState } };
};

export default MultiWordlePage;
