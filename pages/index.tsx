import type { NextPage, NextPageContext } from "next";
import { useState } from "react";
import { colors } from "../constants/colors";
import DICTIONARY from "../dictionary.json";
import { post } from "../helpers";
import {
  AcceptGameMove,
  GameStatus,
  ReturnCharacter,
  ReturnGameMove,
  ReturnWord,
} from "./api/post/multiwordle";

import InputField from "../components/multiwordle/InputField";
import ImageFrame from "../components/misc/ImageFrame";
import Carousel from "../components/multiwordle/Carousel";
import Keyboard from "../components/multiwordle/Keyboard";
import ErrorDialog from "../components/dialogs/ErrorDialog";
import WinDialog from "../components/dialogs/WinDialog";
import ErrorPage from "../components/misc/ErrorPage";

import styles from "../styles/pages/MultiWordle.module.css";

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

function getColorMap(gameStates: ReturnGameMove[], activeSlide: number) {
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

const MultiWordlePage: NextPage<{ initalGameState: ReturnGameMove }> = ({
  initalGameState: initalGameState,
}) => {
  const [history, setHistory] = useState<ReturnGameMove[]>([initalGameState]);
  const [error, setError] = useState(false);
  const [gameState, setGameState] = useState(initalGameState);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);

  const [warning, setWarning] = useState<string | undefined>();
  const [hasWon, setHasWon] = useState(false);

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

    const res = await post<ReturnGameMove>("api/post/multiwordle", gameState);
    const newGameMove = (await res.json()) as ReturnGameMove;

    if (!newGameMove) return setError(true);

    setDisplayBest(true);
    setHistory([newGameMove, ...history]);
    setGameState(newGameMove);
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

  const slides = gameStackToSlides([gameState, ...history]);
  const colorMap = getColorMap(history, activeSlide);
  const bestGuesses = getBestGuesses(slides);

  if (error) return <ErrorPage />;

  return (
    <div className={styles.container}>
      <ErrorDialog
        setIsOpen={() => setWarning(undefined)}
        isOpen={Boolean(warning)}
        text={warning ?? ""}
      />
      <WinDialog gameStack={history} isOpen={hasWon} setIsOpen={setHasWon} />
      <div className={styles.left}>
        <ImageFrame path={gameState.imagePath} />
        <InputField
          gameState={gameState}
          activeSlide={activeSlide}
          bestGuesses={bestGuesses}
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
