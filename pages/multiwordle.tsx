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
import { colors } from "../constants/colors";

const getNewInputs = (input: string, gameState: ReturnGameMode) => {
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
};

const gameStackToSlides = (gameStates: ReturnGameMode[]) => {
  const slides: ReturnCharacter[][][] = [];
  gameStates.forEach((gameState, gameStateIndex) => {
    gameState.inputs.forEach((input: ReturnWord, inputIndex) => {
      if (!slides[inputIndex]) slides.push([]);
      if (!slides[inputIndex][gameStateIndex]) slides[inputIndex].push([]);

      let { characters } = input;

      const filtered = characters.filter(({ status }) => status === "green");
      if (filtered.length === characters.length) characters = [];

      if (gameStateIndex === 0) {
        characters = characters.map(({ character }) => {
          return { status: "empty", character };
        });

        if (input.completed) {
          const nextGameState = gameStates[gameStateIndex + 1];
          characters = nextGameState.inputs[inputIndex].characters;
        }
      }

      slides[inputIndex][gameStateIndex].push(...characters);
    });
  });

  return slides;
};

function getColorMap(gameStates: ReturnGameMode[], activeSlide: number) {
  const keyMap: { [key: string]: string } = {};
  gameStates.forEach((gameState) => {
    gameState.inputs[activeSlide].characters.forEach(
      ({ character, status }) => {
        keyMap[character] = colors[status];
      }
    );
  });
  return keyMap;
}

const imagePath =
  "/prototypes/multiwordle/a_nighttime_cityscape_of_tokyo_harbor_chillwave_style_trending_on_artstation.png";

const MultiWordlePage: NextPage<{ initalGameState: ReturnGameMode }> = ({
  initalGameState: initalGameState,
}) => {
  const [gameStateStack, setGameStateStack] = useState<ReturnGameMode[]>([]);
  const [gameState, setGameState] = useState(initalGameState);
  const [activeSlide, setActiveSlide] = useState(0);

  const onPress = (userInput: string) => {
    const inputs = getNewInputs(userInput, gameState);
    setGameState({ ...gameState, inputs });
  };

  const onSubmit = async () => {
    const res = await post<ReturnGameMode>("api/post/multiwordle", gameState);
    const json = (await res.json()) as ReturnGameMode;

    setGameStateStack([json, ...gameStateStack]);
    setGameState(json);
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <ImageFrame path={imagePath} />
        <InputField gameState={gameState} activeSlide={activeSlide} />
      </div>
      <div className={styles.right}>
        <Carousel
          slides={gameStackToSlides([gameState, ...gameStateStack])}
          setSlide={setActiveSlide}
        />
        <Keyboard
          onPress={onPress}
          onSubmit={onSubmit}
          colorMap={getColorMap(gameStateStack, activeSlide)}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async ({ req }: NextPageContext) => {
  const url = new URL(
    "api/post/multiwordle",
    `http://${req?.headers.host}`
  ).toString();

  const gameState = {
    gameStatus: "new" as GameStatus,
    gameId: undefined,
    summary: undefined,
    inputs: undefined,
  };

  const res = await post<AcceptGameMove>(url, gameState);

  const initalGameState = await res.json();
  return { props: { initalGameState } };
};

export default MultiWordlePage;
