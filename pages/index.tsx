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
} from "../schemas";
import InputField from "../components/multiwordle/InputField";
import ImageFrame from "../components/misc/ImageFrame";
import Carousel from "../components/multiwordle/Carousel";
import Keyboard from "../components/multiwordle/Keyboard";
import ErrorDialog from "../components/dialogs/ErrorDialog";
import ErrorPage from "../components/misc/ErrorPage";
import Header from "../components/header/Header";

import styles from "../styles/pages/MultiWordle.module.css";
import { Request } from "./api/post/multiwordle";
import { useAccount } from "wagmi";
import { AnimationKeys } from "../constants/animationModes";

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

type MultiWordleProps = {
  initialGameState: GameMove;
};

const MultiWordlePage: NextPage<MultiWordleProps> = ({ initialGameState }) => {
  const [history, setHistory] = useState<GameMove[]>([initialGameState]);
  const [error, setError] = useState(false);
  const [won, setWon] = useState(false);
  const [gameState, setGameState] = useState(initialGameState);
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);
  const [warning, setWarning] = useState<string | undefined>();
  const [hasWon, setHasWon] = useState(false);
  const [account, setAccount] = useState<Account | undefined>();
  const [animationMode, setAnimationMode] = useState<AnimationKeys>("error");

  const maxLength = Math.max(...gameState.summary);

  const signIn: SignIn = useCallback(
    async (id, type) => {
      setAccount({ id, type });
      const response = await get(
        `api/get/account/${id}/${initialGameState.gameId}`
      );
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

  const disconnect = () => {
    setAccount(undefined);
  };

  const address = useAccount().data?.address;

  useEffect(() => {
    if (address) signIn(address, "wallet");
    else disconnect();
  }, [address, signIn]);

  if (initialGameState.gameId === undefined || error) return <ErrorPage />;

  const onPress = (userInput: string) => {
    const inputs = getNewInputs(userInput, gameState);

    setDisplayBest(userInput === "");
    setGameState({ ...gameState, inputs });
  };

  const onSubmit = async (userInput: string) => {
    if (!(DICTIONARY as string[]).includes(userInput)) {
      setIsAnimated(true);
      // setAnimationMode("error");
      setAnimationMode("error");
      return false;
    }

    console.log("looking for api");
    const res = await post<GameMove>("api/post/multiwordle", {
      ...gameState,
      account,
    });
    console.log("got the for api");
    if (res.status === 200) {
      const parsedResponse = GameMoveSchema.safeParse(await res.json());
      if (parsedResponse.success) {
        const newGameMove = parsedResponse.data;

        setHistory([newGameMove, ...history]);
        setGameState(newGameMove);
        setDisplayBest(true);
        setAnimationMode("input");
        return true;
      }
    }
    setError(true);
    return true;
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

  const slides = gameStackToSlides([gameState, ...history]);
  const colorMap = getColorMap(history, activeSlide);
  return (
    <div className={styles.container}>
      <ErrorDialog
        setIsOpen={() => setWarning(undefined)}
        isOpen={Boolean(warning)}
        text={warning ?? ""}
      />
      <div className={styles.left}>
        <ImageFrame path={gameState.imagePath} />
        <InputField
          gameState={displayBest ? history[0] : gameState}
          activeSlide={activeSlide}
          displayBest={displayBest}
          animationMode={animationMode}
          setAnimationMode={setAnimationMode}
        />
      </div>
      <div className={styles.right}>
        <Header signIn={signIn} account={account} disconnect={disconnect} />
        <div className={styles.game}>
          <Carousel
            slides={slides}
            slideState={[activeSlide, setActiveSlide]}
            displayBest={displayBest}
          />
          <Keyboard
            onPress={onPress}
            onSubmit={onSubmit}
            colorMap={colorMap}
            maxLength={maxLength}
          />
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
