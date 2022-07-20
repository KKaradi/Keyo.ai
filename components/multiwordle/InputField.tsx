import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import { ReturnGameMode } from "../../pages/api/post/multiwordle";

type InputFieldProps = {
  gameState: ReturnGameMode;
};

const cellSize = 35;

const colorMap = {
  gray: "#787c7f",
  green: "#6ca965",
  yellow: "#c8b653",
  empty: "#FFFFFF",
};

const InputField: NextPage<InputFieldProps> = ({ gameState }) => {
  return (
    <div className={styles.body}>
      {gameState.inputs.map((input, inputIndex) => {
        return (
          <div
            key={inputIndex}
            className={styles.word}
            style={{
              height: `${cellSize}px`,
              width: `${input.characters.length * 40}px`,
            }}
          >
            {input.characters.map((character, characterIndex) => {
              return (
                <a href={`#slide-${inputIndex + 1}`} key={characterIndex}>
                  <div
                    className={styles.cell}
                    style={{
                      height: `${cellSize}px`,
                      width: `${cellSize}px`,
                      backgroundColor: colorMap[character.status],
                    }}
                  >
                    {character.character}
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
