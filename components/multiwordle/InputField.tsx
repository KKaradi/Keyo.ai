import { NextPage } from "next";
import { GameMove, Word } from "../../pages/api/schemas";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import Square from "../misc/Square";

type InputFieldProps = {
  gameState: GameMove;
  activeSlide: number;
  bestGuesses?: Word[];
};

const InputField: NextPage<InputFieldProps> = ({
  gameState,
  activeSlide,
  bestGuesses,
}) => {
  return (
    <div className={styles.body}>
      {(bestGuesses ?? gameState.inputs ?? []).map((input, inputIndex) => {
        const backgroundColor = activeSlide === inputIndex ? "#ddd" : undefined;
        return (
          <div
            key={inputIndex}
            className={styles.word}
            style={{ backgroundColor }}
          >
            {input.characters.map(({ character, status }, characterIndex) => {
              const color = input.completed || bestGuesses ? status : "empty";
              return (
                <a href={`#slide-${inputIndex + 1}`} key={characterIndex}>
                  <div className={styles.cell}>
                    <Square character={character} color={color} />
                  </div>
                </a>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default InputField;
