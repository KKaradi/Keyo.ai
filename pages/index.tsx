import type { NextPage, NextPageContext } from "next";
import { useState } from "react";
import { colors } from "../constants/colors";
import DICTIONARY from "../dictionary.json";
import { post } from "../helpers";
import { GameMove, Word, Character, GameMoveSchema } from "./api/schemas";
import InputField from "../components/multiwordle/InputField";
import ImageFrame from "../components/misc/ImageFrame";
import Carousel from "../components/multiwordle/Carousel";
import Keyboard from "../components/multiwordle/Keyboard";
import ErrorDialog from "../components/dialogs/ErrorDialog";
import WinDialog from "../components/dialogs/WinDialog";
import ErrorPage from "../components/misc/ErrorPage";
import Header from "../components/header/Header";

import styles from "../styles/pages/MultiWordle.module.css";
import { Request } from "./api/post/multiwordle";

function getNewInputs(input: string, gameState: GameMove): Word[] {
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
    } as Word;
  });
}

function gameStackToSlides(gameStates: GameMove[]): Character[][][] {
  const slides: Character[][][] = [];

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

function getColorMap(gameStates: GameMove[], activeSlide: number) {
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

type MultiWordleProps = {
  initalGameState: GameMove;
};

const MultiWordlePage: NextPage<MultiWordleProps> = ({ initalGameState }) => {
  const [history, setHistory] = useState<GameMove[]>([initalGameState]);
  const [error, setError] = useState(false);
  const [gameState, setGameState] = useState(initalGameState);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);

  const [warning, setWarning] = useState<string | undefined>();
  const [hasWon, setHasWon] = useState(false);

  if (initalGameState.gameId === undefined || error) return <ErrorPage />;

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

    const res = await post<GameMove>("api/post/multiwordle", gameState);
    const parsedResponse = GameMoveSchema.safeParse(await res.json());
    if (!parsedResponse.success) return setError(true);

    const newGameMove = parsedResponse.data;
    console.log(newGameMove);

    setDisplayBest(true);
    setHistory([newGameMove, ...history]);
    setGameState(newGameMove);
  };

  const getSimilarityScore = (word: Character[]) => {
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

  const getBestGuesses = (slides: Character[][][]) => {
    if (!displayBest) return undefined;

    const bestGuesses: Word[] = [];

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
        <Header />
        <div className={styles.game}>
          <Carousel
            slides={slides}
            slideState={[activeSlide, setActiveSlide]}
            displayBest={displayBest}
          />
          <Keyboard onPress={onPress} onSubmit={onSubmit} colorMap={colorMap} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async ({
  req,
}: NextPageContext): Promise<{ props: MultiWordleProps }> => {
  const url = new URL(
    "api/post/multiwordle",
    `http://${req?.headers.host}`
  ).toString();

  const response = await post<Request>(url, { gameStatus: "new" });

  if (response.status === 200) {
    const parsedResponse = GameMoveSchema.safeParse(await response.json());
    if (parsedResponse.success) {
      return { props: { initalGameState: parsedResponse.data } };
    }
  }

  return { props: { initalGameState: {} } as MultiWordleProps };
};

export default MultiWordlePage;
