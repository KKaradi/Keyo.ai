import type { NextPage, NextPageContext } from "next";
import { post } from "../helpers";
import { DefinedCharacter, DefinedGameMove } from "./api/post/multiwordle";
import styles from "../styles/pages/MultiWordle.module.css";
import Carousel from "../components/multiwordle/Carousel";
import Keyboard from "../components/multiwordle/Keyboard";
import { useEffect, useState } from "react";

const endpoint = "/api/post/multiwordle";

const MultiWordlePage: NextPage = () => {
  const [guess, setGuess] = useState("");
  const [gameId, setGameId] = useState<number | undefined>();
  const [game, setGame] = useState<DefinedGameMove[]>([]);

  useEffect(() => {
    (async () => {
      const res = await post(endpoint, { gameStatus: "new" });
      const gameMove = (await res.json()) as DefinedGameMove;
      setGame([gameMove]);
      setGameId(gameMove.gameId);
    })();
  });

  const onPress = (key: string) => {
    if (key === "BACKSPACE") return setGuess(guess.slice(0, guess.length - 1));
    return setGuess(guess + key);
  };

  const onSubmit = async () => {
    if (!gameId) return;
    const res = await post<DefinedGameMove>(endpoint, {
      gameId,
      gameStatus: "started",
      inputs: game[0].inputs.map((input) => {
        return {
          completed: false,
          characters: guess
            .slice(0, input.characters.length)
            .padEnd(input.characters.length)
            .split("")
            .map((character) => {
              return { character, status: "gray" };
            }),
        };
      }),
    });
    const gameMove = (await res.json()) as DefinedGameMove;
    console.log(gameMove);
  };

  const slides: DefinedCharacter[][][] = [];

  game.forEach((gameState, gameStateIndex) => {
    gameState.inputs.forEach((input, inputIndex) => {
      if (inputIndex >= slides.length) slides.push([]);

      const slide = slides[inputIndex];
      if (gameStateIndex >= slide.length) slide.push([]);

      const characters = slide[gameStateIndex];
      slides[inputIndex][gameStateIndex] = [...characters, ...input.characters];
    });
  });

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <h1> {guess} </h1>
      </div>
      <div className={styles.right}>
        <Carousel slides={slides} />
        <Keyboard onPress={onPress} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default MultiWordlePage;
