import { NextPage } from "next";
import styles from "../../styles/Wordle/Wordles.module.css";
import Wordle from "./Wordle";
import { useState } from "react";

type WordlesProps = {
  prompt: string;
  maxAttempts?: number;
};

const Wordles: NextPage<WordlesProps> = ({ prompt, maxAttempts }) => {
  const words = prompt.split(" ");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const wordles = words.map((word, index) => (
    <div
      className={styles.wordle}
      key={index}
      onClick={() => setSelectedIndex(index)}
    >
      <Wordle
        word={word.toUpperCase()}
        maxAttempts={maxAttempts}
        isSelected={selectedIndex == index}
      />
    </div>
  ));

  return <div className={styles.wordleRow}>{wordles}</div>;
};

export default Wordles;
