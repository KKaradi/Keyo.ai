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
  AccountSchema,
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
import { z } from "zod";
import PostGame from "../components/dialogs/PostGame";
import BuyNFT from "../components/dialogs/BuyNFT";
import Head from "next/head";
import { useMediaQuery } from "@mui/material";

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
        if (
          keyMap[character] === undefined ||
          ["green", "yellow", "gray", "empty"].includes(status)
        ) {
          keyMap[character] = colors[status];
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

const MultiWordlePage: NextPage<MultiWordleProps> = (props) => {
  const { initialGameState, initialHistory } = props;
  const initialAccount = initialGameState.account;

  const [history, setHistory] = useState(
    initialHistory ? initialHistory : [initialGameState]
  );
  const [gameState, setGameState] = useState(initialGameState);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [won, setWon] = useState(initialGameState.gameStatus === "finished");
  const [activeSlide, setActiveSlide] = useState(0);
  const [displayBest, setDisplayBest] = useState(true);
  const [warning, setWarning] = useState<string | undefined>();
  const [openWinDialog, setOpenWinDialog] = useState(
    initialGameState.gameStatus === "finished"
  );

  const [account, setAccount] = useState<Account>(initialAccount);
  const [animationMode, setAnimationMode] = useState<AnimationKeys>("none");
  const [openPopUp, setOpenPopUp] = useState(false);

  const [inTutorial, setInTutorial] = useState(true);
  const fadeTutorialDialog = useState(false);
  const postGameDialogIsOpen = useState(false);
  const [inPostGame, setInPostGame] = useState(false);
  const buyNFTDialogIsOpen = useState(false);

  const isMobile = useMediaQuery("(max-device-width: 480px)");

  // local storage calls should be wrapped in use effect
  useEffect(() => {
    if (window === undefined) return;
    setInTutorial(localStorage.getItem("completedTutorial") !== "true");
  }, []);

  const signIn: SignIn = useCallback(async (address, type) => {
    const res = await get(`/api/get/account/${account.id}/${type}/${address}`);
    if (res.status !== 200) {
      setError(true);
      return;
    }

    const json = await res.json();
    if (res.status === 200) {
      const parsedId = AccountSchema.safeParse(json);
      if (parsedId.success) {
        return setAccount(parsedId.data);
      }

      const parsedMoves = z.array(GameMoveSchema).safeParse(json);
      if (!parsedMoves.success) {
        setError(true);
        return;
      }
      setAccount(parsedMoves.data[0].account);
      const { data: moves } = parsedMoves;
      setHistory(moves.reverse());
      setGameState(moves[0]);
    } else {
      setError(true);
      setErrorMessage(json.message);
    }
  }, []);

  const disconnect = async () => {
    setAccount(initialAccount);
    const res = await get(
      `/api/get/account/${initialAccount.id}/${initialAccount.type}/${initialAccount.address}`
    );

    if (res.status !== 200) {
      setError(true);
      setErrorMessage((await res.json()).message);
      return;
    }

    const parsedMoves = z.array(GameMoveSchema).safeParse(await res.json());

    if (!parsedMoves.success) {
      setError(true);
      return;
    }
    setAccount(parsedMoves.data[0].account);

    const { data: moves } = parsedMoves;
    setHistory(moves.reverse());
    setGameState(moves[0]);
  };

  const address = useAccount().data?.address;

  useEffect(() => {
    if (address) signIn(address, "WALLET");
    else disconnect();
  }, [address, signIn]);

  if (initialGameState.gameId === undefined || error)
    return <ErrorPage errorMessage={errorMessage} />;

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

    const move = { ...gameState, text: userInput, account };
    const res = await post<GameMove>("api/post/multiwordle", move);

    if (res.status === 200) {
      const parsedResponse = GameMoveSchema.safeParse(await res.json());
      if (parsedResponse.success) {
        const newGameMove = parsedResponse.data;
        if (!inPostGame && newGameMove.inPostGame)
          postGameDialogIsOpen[1](true);
        setInPostGame(newGameMove.inPostGame);
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
    setErrorMessage((await res.json()).message);
    return true;
  };

  const slides = gameStackToSlides([gameState, ...history]);
  const colorMap = getColorMap(history, activeSlide);

  const header = (
    <Header
      signIn={signIn}
      account={account}
      disconnect={disconnect}
      won={won}
      setOpenWinDialog={setOpenWinDialog}
    />
  );

  const inputField = (
    <InputField
      fadeTutorialDialog={fadeTutorialDialog}
      inTutorial={isMobile ? false : inTutorial}
      gameState={displayBest ? history[0] : gameState}
      activeSlide={activeSlide}
      displayBest={displayBest}
      animationMode={animationMode}
      setAnimationMode={setAnimationMode}
    />
  );

  const carousel = (
    <Carousel
      slides={slides}
      slideState={[activeSlide, setActiveSlide]}
      displayBest={displayBest}
      isMobile={isMobile}
    />
  );

  console.log(isMobile);

  return (
    <Tutorial inTutorial={isMobile ? false : inTutorial}>
      <div className={styles.container}>
        <Head>
          <title>Keyo</title>
          <link rel="icon" href="/icon.jpeg" />
        </Head>
        <BuyNFT
          openState={buyNFTDialogIsOpen}
          gameState={gameState}
          winDialogOpenState={[openWinDialog, setOpenWinDialog]}
        />
        <PostGame
          openState={postGameDialogIsOpen}
          usingWallet={gameState.account.type === "WALLET"}
        />
        <WinDialog
          globalPosition={gameState.globalPosition}
          setIsOpen={setOpenWinDialog}
          isOpen={openWinDialog}
          usingWallet={gameState.account.type === "WALLET"}
          gameStack={history}
          buyNFTDialogState={buyNFTDialogIsOpen}
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

        <div className={styles.mobileHeader}> {header} </div>

        <div className={styles.left}>
          <ImageFrame path={gameState.imagePath} />
          <div className={styles.mobileScrollable}>
            <div className={styles.mobileView}>
              <div className={styles.inputField}>{inputField} </div>
              {isMobile ? (
                <div className={styles.mobileCarousel}>{carousel}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.header}>{header}</div>
          <div className={styles.game}>
            {isMobile ? null : (
              <div className={styles.carousel}> {carousel} </div>
            )}
            <div className={styles.keyboard}>
              <Keyboard
                onPress={onPress}
                onSubmit={onSubmit}
                colorMap={colorMap}
                maxLength={maxLength}
              />
            </div>
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

  const { cookieId } = nookies.get(ctx) as {
    [key: string]: string | undefined;
  };

  const response = await post<Request>(url, {
    gameStatus: "new",
    account: { id: "", type: "COOKIE", address: cookieId },
  });

  const json = await response.json();

  if (response.status === 200) {
    if (Array.isArray(json)) {
      const parsedResponse = z.array(GameMoveSchema).safeParse(json);
      if (parsedResponse.success) {
        const moves = parsedResponse.data;
        return {
          props: {
            initialGameState: moves[moves.length - 1],
            initialHistory: moves.reverse(),
          },
        };
      }
    }

    const parsedResponse = GameMoveSchema.safeParse(json);
    if (parsedResponse.success) {
      const { data } = parsedResponse;

      nookies.set(ctx, "cookieId", parsedResponse.data.account.id);
      return { props: { initialGameState: data } };
    }
  }

  return { props: { initialGameState: {} } as MultiWordleProps };
};

export default MultiWordlePage;
