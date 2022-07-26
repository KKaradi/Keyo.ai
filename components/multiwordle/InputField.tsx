import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import { ReturnGameMove, ReturnWord } from "../../pages/api/post/multiwordle";
import Square from "../misc/Square";

type InputFieldProps = {
  gameState: ReturnGameMove;
  activeSlide: number;
  bestGuesses?: ReturnWord[];
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
