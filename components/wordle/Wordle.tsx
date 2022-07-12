import { NextPage } from "next";
import styles from "../../styles/components/wordle/Wordle.module.css";
import WordleRow from "./WordleRow";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../../constants/colors";
import { post } from "../../helpers";

export type Box = { content: string; color: string };

const generateRow = (width: number): Box[] => {
  return Array.from(Array(width).keys()).map(() => {
    return { content: "", color: colors.blank };
  });
};

const isCapitalLetter = (content: string) => {
  return content.length == 1 && /[A-Z]/.test(content);
};

const updateColors = async (guess: Box[], idx: number) => {
  const res = await post("/api/post/validateguess", {
    guess: guess,
    wordIdx: idx,
  });
  const data = await res.json();

  return data;
};

const guessedCorrectly = (rowArray: Box[]) => {
  const correctBoxes = rowArray.filter((value) => value.color == colors.green);
  return correctBoxes.length == rowArray.length;
};

type WordleProps = {
  word: string;
  idx: number;
  maxAttempts?: number;
  isSelected: boolean;
};

const Wordle: NextPage<WordleProps> = ({
  word,
  idx,
  maxAttempts,
  isSelected,
}) => {
  const [width, height] = [word.length, maxAttempts];
  const [grid, setGrid] = useState([generateRow(width)]);
  const [position, setPosition] = useState({ col: 0, row: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  const keyPressHandler = useCallback(
    async (event: KeyboardEvent) => {
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
        grid[row] = await updateColors(grid[row], idx);
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
