import type { NextPage, NextPageContext } from "next";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../constants/colors";
import DICTIONARY from "../dictionary.json";
import { get, post } from "../helpers";
import {
  GameMove,
  Word,
  Character,
  GameMoveSchema,
  Account,
  AccountType,
  GameMovesSchema,
} from "./api/schemas";
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
import { useAccount } from "wagmi";

function getNewInputs(input: string, gameState: GameMove): Word[] {
  if (gameState.inputs === undefined) return [];
  return gameState.inputs.map((word) => {
    if (word.completed) return word;
    return {
      completed: false,
      characters: word.characters.map(({ status }, index) => {
        const charAt = input.charAt(index);
        const character = charAt === "" ? " " : charAt;
        return { character, status };
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

export type SignIn = (id: string, type: AccountType) => Promise<void>;

const warnings = {
  dictionary: "That word was not in our dictionary.",
};

type MultiWordleProps = {
  initialGameState: GameMove;
};

const MultiWordlePage: NextPage<MultiWordleProps> = ({ initialGameState }) => {
  const [history, setHistory] = useState<GameMove[]>([initialGameState]);
  const [error, setError] = useState(false);
  const [gameState, setGameState] = useState(initialGameState);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);

  const [warning, setWarning] = useState<string | undefined>();
  const [hasWon, setHasWon] = useState(false);

  const [account, setAccount] = useState<Account | undefined>();

  const signIn: SignIn = useCallback(
    async (id, type) => {
      setAccount({ id, type });
      const response = await get(`api/get/account/${id}`);
      if (response.status === 200) {
        const res = GameMovesSchema.safeParse(await response.json());
        if (!res.success) return;
        setHistory([...res.data, initialGameState]);
        setGameState(res.data[0] ?? initialGameState);
        setDisplayBest(true);
      }
    },
    [initialGameState]
  );

  const address = useAccount().data?.address;

  useEffect(() => {
    if (address) signIn(address, "wallet");
  }, [address, signIn]);

  if (initialGameState.gameId === undefined || error) return <ErrorPage />;

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

    const res = await post<GameMove>("api/post/multiwordle", {
      ...gameState,
      account,
    });

    if (res.status === 200) {
      const parsedResponse = GameMoveSchema.safeParse(await res.json());
      if (parsedResponse.success) {
        const newGameMove = parsedResponse.data;

        setHistory([newGameMove, ...history]);
        setGameState(newGameMove);
        return setDisplayBest(true);
      }
    }

    return setError(true);
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
        <Header signIn={signIn} />
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
      return { props: { initialGameState: parsedResponse.data } };
    }
  }

  return { props: { initialGameState: {} } as MultiWordleProps };
};

export default MultiWordlePage;
