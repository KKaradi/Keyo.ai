import type { NextPage, NextPageContext } from "next";
import { post } from "../helpers";
import {
  AcceptGameMove,
  GameStatus,
  ReturnCharacter,
  ReturnGameMove,
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
import WinDialogue from "../components/multiwordle/WinDialogue";

function getNewInputs(input: string, gameState: ReturnGameMove): ReturnWord[] {
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
  gameStates: ReturnGameMove[]
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
  initalGameState: ReturnGameMove;
  initalErrorState: boolean;
}> = ({ initalGameState, initalErrorState }) => {
  const [gameStack, setGameStack] = useState<ReturnGameMove[]>([
    initalGameState,
  ]);
  const [errorState, setErrorState] = useState(initalErrorState);
  const [gameState, setGameState] = useState(initalGameState);
  const [newDataFlag, setNewDataFlag] = useState(true);

  const onPress = (userInput: string) => {
    const inputs = getNewInputs(userInput, gameState);
    setNewDataFlag(userInput === "");
    setGameState({ ...gameState, inputs });
  };

  const onSubmit = async () => {
    const response = await post<ReturnGameMove>(
      "api/post/multiwordle",
      gameState as ReturnGameMove
    );

    if (response.status === 200) {
      const newGameState = await response.json();
      setNewDataFlag(true);

      setGameStack([newGameState, ...gameStack]);
      setGameState(newGameState);
    } else {
      setNewDataFlag(true);
      setErrorState(true);
    }
  };
  return (
    <ErrorFeature error={errorState}>
      <WinDialogue
        open={gameState.gameStatus === "finished"}
        gameStack={gameStack}
      />
      <div className={styles.container}>
        <div className={styles.left}>
          {gameState.imagePath === undefined ? (
            <div>Failed To Load</div>
          ) : (
            <ImageFrame path={gameState.imagePath}></ImageFrame>
          )}
          <InputField
            gameState={gameState}
            previousGameState={gameStack[0]}
            newDataFlag={newDataFlag}
          />
        </div>
        <div className={styles.right}>
          <Carousel slides={gameStackToSlides([gameState, ...gameStack])} />
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
    gameStatus: "started" as GameStatus,
    imagePath: undefined,
    gameId: undefined,
    summary: undefined,
    inputs: undefined,
    stats: undefined,
    nextGameDate: undefined,
  };

  const response = await post<AcceptGameMove>(url, gameState);

  if (response.status === 200) {
    const initalGameState = await response.json();
    return { props: { initalGameState, initalErrorState: false } };
  } else {
    return { props: { initalGameState: {}, initalErrorState: true } };
  }
};

export default MultiWordlePage;
