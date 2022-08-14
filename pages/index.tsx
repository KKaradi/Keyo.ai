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
import WinDialog from "../components/dialogs/WinDialog";
import PopUp from "../components/misc/PopUp";
import TutorialProps from "../components/multiwordle/Tutorial";
import Tutorial from "../components/multiwordle/Tutorial";

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
        if (keyMap[character] === undefined) {
          keyMap[character] = colors[status];
          return;
        }
        if (status === "green") {
          keyMap[character] = colors[status];
          return;
        }
        if (status === "yellow") {
          keyMap[character] = colors[status];
          return;
        }
        if (status === "gray") {
          keyMap[character] = colors[status];
          return;
        }
        if (status === "empty") {
          keyMap[character] = colors[status];
          return;
        }
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
  const [warning, setWarning] = useState<string | undefined>();
  const [openWinDialogue, setOpenWinDialogue] = useState(false);
  const [account, setAccount] = useState<Account | undefined>();
  const [animationMode, setAnimationMode] = useState<AnimationKeys>("none");
  const [openPopUp, setOpenPopUp] = useState(false);
  const maxLength = Math.max(...gameState.summary);
  const [inTutorial, setInTutorial] = useState(true);
  const fadeTutorialDialogue = useState(false);

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
    if (won) {
      setOpenWinDialogue(true);
      return false;
    }
    if (!(DICTIONARY as string[]).includes(userInput)) {
      setAnimationMode("error");
      setOpenPopUp(true);
      return false;
    }
    if (inTutorial) {
      setInTutorial(false);
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
        setDisplayBest(true);
        setAnimationMode("input");
        if (newGameMove.gameStatus === "finished") {
          setWon(true);
          setOpenWinDialogue(true);
        }
        return true;
      }
    }
    setError(true);
    return true;
  };

  const slides = gameStackToSlides([gameState, ...history]);
  const colorMap = getColorMap(history, activeSlide);
  return (
    <Tutorial inTutorial={inTutorial}>
      <div className={styles.container}>
        <WinDialog
          setIsOpen={setOpenWinDialogue}
          isOpen={openWinDialogue}
          gameStack={history}
        />
        <PopUp
          text={"Not a valid word"}
          alertLevel={"warning"}
          open={openPopUp}
          setOpen={setOpenPopUp}
        />
        <ErrorDialog
          setIsOpen={() => setWarning(undefined)}
          isOpen={Boolean(warning)}
          text={warning ?? ""}
        />
        <div className={styles.left}>
          <ImageFrame path={gameState.imagePath} />
          <InputField
            fadeTutorialDialogue={fadeTutorialDialogue}
            inTutorial={inTutorial}
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
    </Tutorial>
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
