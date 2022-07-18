import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";

type InputFieldProps = {
  input: string;
};

const cellSize = 40;

function generateWordGrid(input: string) {
  const inputArray: string[] = [];

  input.split(",").forEach((word, indx) => {
    if (indx != 0) {
      inputArray.push(" ");
    }
    inputArray.push(word);
  });

  return inputArray.map((split, idx) => {
    return (
      <div
        key={idx}
        className={styles.word}
        style={{ height: `${cellSize}px`, width: `${split.length * 40}px` }}
      >
        {split.split("").map((letter, idx) => {
          return (
            <div
              key={idx}
              className={styles.cell}
              style={{ height: `${cellSize}px`, width: `${cellSize}px` }}
            >
              {letter}
            </div>
          );
        })}
      </div>
    );
  });
}

const InputField: NextPage<InputFieldProps> = ({ input }) => {
  return <div className={styles.body}>{generateWordGrid(input)}</div>;
};

export default InputField;
