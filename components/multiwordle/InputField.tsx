import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import { ReturnGameMode } from "../../pages/api/post/multiwordle";
import Square from "./Square";

type InputFieldProps = {
  gameState: ReturnGameMode;
};

const cellSize = 32;

const colorMap = {
  gray: "#787c7f",
  green: "#6ca965",
  yellow: "#c8b653",
  empty: "#FFFFFF",
};

const InputField: NextPage<InputFieldProps> = ({ gameState }) => {
  return (
    <div className={styles.body}>
      <div>
        {gameState.inputs.map((input, inputIndex) => {
          return (
            <div key={inputIndex} className={styles.word}>
              {input.characters.map((character, characterIndex) => {
                return (
                  <a href={`#slide-${inputIndex + 1}`} key={characterIndex}>
                    <Square
                      key={characterIndex}
                      character={character.character}
                      color={character.status}
                      width={`${cellSize}px`}
                      height={`${cellSize}px`}
                      style={{margin:"3px 3px"}}
                    />
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InputField;
