import { NextPage } from "next";
import styles from "../../styles/components/Wordle/WordleRow.module.css";
import { Box } from "./Wordle";
import WordleBox from "./WordleBox";

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
