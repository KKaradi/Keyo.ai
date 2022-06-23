import { NextPage } from "next";
import styles from "../../styles/components/wordle/Wordle.module.css";
import WordleRow from "./WordleRow";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../../constants/colors";

export type Box = { content: string; color: string };

const generateRow = (width: number): Box[] => {
  return Array.from(Array(width).keys()).map(() => {
    return { content: "", color: colors.blank };
  });
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

type WordleProps = {
  word: string;
  maxAttempts?: number;
  isSelected: boolean;
};

const Wordle: NextPage<WordleProps> = ({ word, maxAttempts, isSelected }) => {
  const [width, height] = [word.length, maxAttempts];
  const [grid, setGrid] = useState([generateRow(width)]);
  const [position, setPosition] = useState({ col: 0, row: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  const keyPressHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!isSelected || !isPlaying) return;

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
        if (guessedCorrectly(grid[row]) || (height && row == height - 1))
          setIsPlaying(false);
        else grid.push(generateRow(width));
        row += 1;
        col = 0;
      }

      setPosition({ col, row });
      setGrid(grid);
    },
    [grid, word, position, width, height, isPlaying, isSelected]
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
