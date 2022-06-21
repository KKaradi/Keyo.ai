import { NextPage } from "next";
import WordleBox from "./WordleBox";
import styles from "../../styles/Wordle/WordleRow.module.css";
import { Box } from "./Wordle";

type WordleRowProps = {
  letters: Box[];
};

const WordleRow: NextPage<WordleRowProps> = ({ letters }) => {
  return (
    <div className={styles.container}>
      {letters.map((letter, key) => {
        return (
          <WordleBox key={key} letter={letter.content} color={letter.color} />
        );
      })}
    </div>
  );
};

export default WordleRow;
