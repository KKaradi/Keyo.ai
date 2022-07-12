import { NextPage } from "next";
import styles from "../../styles/components/wordle/Wordles.module.css";
import { useState } from "react";
import Wordle from "./Wordle";

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
        idx={index}
        maxAttempts={maxAttempts}
        isSelected={selectedIndex == index}
      />
    </div>
  ));

  return <div className={styles.wordleRow}>{wordles}</div>;
};

export default Wordles;
