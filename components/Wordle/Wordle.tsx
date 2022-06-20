import { NextPage } from "next";
import WordleRow from "./WordleRow";
import styles from "../../styles/Wordle/Wordle.module.css";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../../constants/colors";

type WordleProps = {
  word: string;
  rowAmount: number;
};

export type Box = { content: string; color: string };

const generateGrid = (width: number, height: number): Box[][] => {
  return Array.from(Array(height).keys()).map(() =>
    Array.from(Array(width).keys()).map(() => {
      return { content: "", color: colors.blank };
    })
  );
};

const isCapitalLetter = (content: string) => {
  return content.length == 1 && /[A-Z]/.test(content);
};

const updateColors = (guess: Box[], word: string) => {
  const wordArray = word.split("");
  const result = guess.map(({ content }, index) => {
    const letterPosition = wordArray.indexOf(content);

    const box = { content: guess[index].content, color: colors.grey };
    if (letterPosition == -1) return box;

    if (guess[index].content == wordArray[index]) box.color = colors.green;
    else box.color = colors.yellow;

    wordArray[letterPosition] = "#";
    return box;
  });

  return result;
};

const guessedCorrectly = (rowArray: Box[]) => {
  const correctBoxes = rowArray.filter((value) => value.color == colors.green);
  return correctBoxes.length == rowArray.length;
};

const Wordle: NextPage<WordleProps> = ({ word, rowAmount }: WordleProps) => {
  const [width, height] = [word.length, rowAmount];
  const [grid, setGrid] = useState(generateGrid(width, height));
  const [position, setPosition] = useState({ col: 0, row: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  const keyPressHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!isPlaying) return;

      let { col, row } = position;
      const key = event.key.toUpperCase();

      if (isCapitalLetter(key) && col < width) {
        grid[row][col].content = key;
        col += 1;
      }

      if (key == "BACKSPACE" && col > 0) {
        grid[row][col - 1].content = "";
        col -= 1;
      }

      if (key == "ENTER" && col == width) {
        grid[row] = updateColors(grid[row], word);
        if (guessedCorrectly(grid[row])) setIsPlaying(false);
        row += 1;
        col = 0;
      }

      if (row == height) setIsPlaying(false);

      setPosition({ col, row });
      setGrid(grid);
    },
    [grid, word, position, width, height, isPlaying]
  );

  useEffect(() => {
    window.addEventListener("keydown", keyPressHandler);
    return () => window.removeEventListener("keydown", keyPressHandler);
  }, [keyPressHandler]);

  const rows: JSX.Element[] = [];
  grid.forEach((rowArray, key) => {
    rows.push(<WordleRow key={key} letters={rowArray} />);
  });

  return <div className={styles.container}>{rows}</div>;
};

export default Wordle;
