import { NextPage } from "next";
import { useEffect } from "react";
import { colors } from "../../constants/colors";
import styles from "../../styles/components/Wordle/WordleBox.module.css";

type WordleBoxProps = {
  letter: string;
  color: string;
};

const WordleBox: NextPage<WordleBoxProps> = ({ letter, color }) => {
  useEffect(() => {
    if (color == colors.blank) return;
  }, [color]);

  return (
    <div className={styles.container} style={{ backgroundColor: color }}>
      <h1 className={styles.letter}> {letter} </h1>
    </div>
  );
};

export default WordleBox;
