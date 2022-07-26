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
import DICTIONARY from "../dictionary.json";
import ErrorDialog from "../components/dialogs/ErrorDialog";

function getNewInputs(input: string, gameState: ReturnGameMode) {
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

function gameStackToSlides(gameStates: ReturnGameMode[]) {
  const slides: ReturnCharacter[][][] = [];
  gameStates.forEach((gameState, gameStateIndex) => {
    gameState.inputs.forEach((input, inputIndex) => {
      if (!slides[inputIndex]) slides.push([]);
      if (!slides[inputIndex][gameStateIndex]) slides[inputIndex].push([]);

      let { characters } = input;

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
}

function getColorMap(gameStates: ReturnGameMode[], activeSlide: number) {
  const keyMap: { [key: string]: string } = {};
  gameStates.forEach((gameState) => {
    gameState.inputs[activeSlide].characters.forEach(
      ({ character, status }) => {
        if (status !== "green") keyMap[character] = colors[status];
      }
    );
  });

  gameStates.forEach((gameState) => {
    gameState.inputs[activeSlide].characters.forEach(
      ({ character, status }) => {
        if (status === "green") keyMap[character] = colors[status];
      }
    );
  });
  return keyMap;
}

const warnings = {
  dictionary: "That word was not in our dictionary.",
};

const MultiWordlePage: NextPage<{ initalGameState: ReturnGameMode }> = ({
  initalGameState: initalGameState,
}) => {
  const [gameStateStack, setGameStateStack] = useState<ReturnGameMode[]>([
    initalGameState,
  ]);
  const [gameState, setGameState] = useState(initalGameState);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);
  const [warning, setWarning] = useState<string | undefined>();

  const onPress = (userInput: string) => {
    const inputs = getNewInputs(userInput, gameState);
    setDisplayBest(userInput === "");
    setGameState({ ...gameState, inputs });
  };

  const onSubmit = async (userInput: string) => {
    if (!(DICTIONARY as string[]).includes(userInput)) {
      setWarning(warnings.dictionary);
      return setDisplayBest(true);
    }

    const res = await post<ReturnGameMode>("api/post/multiwordle", gameState);
    const json = (await res.json()) as ReturnGameMode;
    setDisplayBest(true);
    setGameStateStack([json, ...gameStateStack]);
    setGameState(json);
  };

  const getSimilarityScore = (word: ReturnCharacter[]) => {
    let total = 0;

    const points = word.reduce((prev, { status }) => {
      total += 2;
      if (status == "green") return prev + 2;
      if (status == "yellow") return prev + 1;
      return prev;
    }, 0);

    const score = points / total;
    const completed = total === points;

    return { word, score, completed };
  };

  const getBestGuesses = (slides: ReturnCharacter[][][]) => {
    if (!displayBest) return undefined;

    const bestGuesses: ReturnWord[] = [];

    slides.forEach((slide) => {
      let bestWord = getSimilarityScore(slide[1]);
      slide.slice(2).forEach((word) => {
        const newWord = getSimilarityScore(word);
        if (newWord.score > bestWord.score) bestWord = newWord;
      });

      bestGuesses.push({
        characters: bestWord.word,
        completed: bestWord.completed,
      });
    });

    return bestGuesses;
  };

  const slides = gameStackToSlides([gameState, ...gameStateStack]);
  const colorMap = getColorMap(gameStateStack, activeSlide);
  const bestGuesses = getBestGuesses(slides);

  return (
    <div className={styles.container}>
      <ErrorDialog
        setIsOpen={() => setWarning(undefined)}
        isOpen={Boolean(warning)}
        text={warning ?? ""}
      />
      <div className={styles.left}>
        <ImageFrame path={gameState.imagePath}></ImageFrame>
        <InputField
          gameState={gameState}
          bestGuesses={bestGuesses}
          activeSlide={activeSlide}
        />
      </div>
      <div className={styles.right}>
        <Carousel
          slides={slides}
          slideState={[activeSlide, setActiveSlide]}
          displayBest={displayBest}
        />
        <Keyboard onPress={onPress} onSubmit={onSubmit} colorMap={colorMap} />
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
