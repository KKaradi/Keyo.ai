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
import Tutorial from "../components/multiwordle/Tutorial";
import nookies from "nookies";

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

      slides[inputIndex][gameStateIndex]?.push(...characters);
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
  initialHistory?: GameMove[];
};

const MultiWordlePage: NextPage<MultiWordleProps> = (ctx) => {
  const { initialGameState, initialHistory } = ctx;
  // console.log(initialGameState);
  const [history, setHistory] = useState(
    initialHistory ? initialHistory : [initialGameState]
  );
  const [gameState, setGameState] = useState(initialGameState);

  const [error, setError] = useState(false);
  const [won, setWon] = useState(initialGameState.gameStatus === "finished");
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);
  const [warning, setWarning] = useState<string | undefined>();
  const [openWinDialog, setOpenWinDialog] = useState(
    initialGameState.gameStatus === "finished"
  );
  const [account, setAccount] = useState<Account | undefined>();
  const [animationMode, setAnimationMode] = useState<AnimationKeys>("none");
  const [openPopUp, setOpenPopUp] = useState(false);

  const [inTutorial, setInTutorial] = useState(true);
  const fadeTutorialDialog = useState(false);

  // local storage calls should be wrapped in use effect
  useEffect(() => {
    if (window === undefined) return;
    setInTutorial(localStorage.getItem("completedTutorial") !== "true");
  }, []);

  const signIn: SignIn = useCallback(async (id, type) => undefined, []);

  const disconnect = () => {
    setAccount(undefined);
  };

  const address = useAccount().data?.address;

  useEffect(() => {
    if (address) signIn(address, "wallet");
    else disconnect();
  }, [address, signIn]);

  if (initialGameState.gameId === undefined || error) return <ErrorPage />;
  const maxLength = Math.max(...gameState.summary);

  const onPress = (userInput: string) => {
    const inputs = getNewInputs(userInput, gameState);

    setDisplayBest(userInput === "");
    setGameState({ ...gameState, inputs });
  };

  const onSubmit = async (userInput: string) => {
    if (won) {
      setOpenWinDialog(true);
      return false;
    }

    if (!(DICTIONARY as string[]).includes(userInput)) {
      setAnimationMode("error");
      setOpenPopUp(true);
      return false;
    }

    if (inTutorial) {
      setInTutorial(false);
      fadeTutorialDialog[1](true);
      localStorage.setItem("completedTutorial", "true");
    }

    const move = { ...gameState, text: userInput };
    const res = await post<GameMove>("api/post/multiwordle", move);

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
          setOpenWinDialog(true);
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
          globalPosition={gameState.globalPosition}
          setIsOpen={setOpenWinDialog}
          isOpen={openWinDialog}
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
            fadeTutorialDialog={fadeTutorialDialog}
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

export const getServerSideProps = async (
  ctx: NextPageContext
): Promise<{ props: MultiWordleProps }> => {
  const url = new URL(
    "api/post/multiwordle",
    `http://${ctx.req?.headers.host}`
  ).toString();

  const { userId } = nookies.get(ctx) as { [key: string]: string | undefined };

  const response = await post<Request>(url, { gameStatus: "new", userId });
  const json = await response.json();

  if (response.status === 200) {
    if (Array.isArray(json)) {
      // add zod check
      // if this response is a gameStack, then inject it as props
      return {
        props: {
          initialGameState: json[json.length - 1],
          initialHistory: json.reverse(),
        },
      };
    }

    const parsedResponse = GameMoveSchema.safeParse(json);
    if (parsedResponse.success) {
      const { data } = parsedResponse;

      nookies.set(ctx, "userId", parsedResponse.data.account.id);
      return { props: { initialGameState: data } };
    }
  }

  return { props: { initialGameState: {} } as MultiWordleProps };
};

export default MultiWordlePage;
