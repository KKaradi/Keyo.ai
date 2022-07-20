import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import { ReturnGameMode } from "../../pages/api/post/multiwordle";

type InputFieldProps = {
  input: string;
  gameState: ReturnGameMode;
  newDataFlag: boolean;
};

const cellSize = 32;

const colorMap = {
  gray: "#787c7f",
  green: "#6ca965",
  yellow: "#c8b653",
  empty: "#FFFFFF",
};

function generateWordGridFromAPI(gameState: ReturnGameMode) {
  return gameState.inputs.map((input, indx) => {
    return (
      <div
        key={indx}
        className={styles.word}
        style={{
          height: `${cellSize}px`,
          width: `${input.characters.length * 40}px`,
        }}
      >
        {input.characters.map((character, indx) => {
          return (
            <div
              key={indx}
              className={styles.cell}
              style={{
                height: `${cellSize}px`,
                width: `${cellSize}px`,
                backgroundColor: colorMap[character.status],
              }}
            >
              {character.character}
            </div>
          );
        })}
      </div>
    );
  });
}

function generateWordGridFromInput(input: string, gameState: ReturnGameMode) {
  //applyInput(input, gameState, setGameState);

  return gameState.inputs.map((input, indx) => {
    const backgroundColor = input.completed ? colorMap["green"] : "";
    return (
      <div
        key={indx}
        className={styles.word}
        style={{
          height: `${cellSize}px`,
          width: `${input.characters.length * cellSize *1.3}px`,
        }}
      >
        {input.characters.map((character, indx) => {
          return (
            <div
              key={indx}
              className={styles.cell}
              style={{
                height: `${cellSize}px`,
                // width: `${cellSize*1.5}px`,
                backgroundColor: backgroundColor,
              }}
            >
              {character.character}
            </div>
          );
        })}
      </div>
    );
  });
}

const InputField: NextPage<InputFieldProps> = ({
  input,
  gameState,
  newDataFlag,
}) => {
  let content: JSX.Element[] = [];
  if (newDataFlag) {
    content = generateWordGridFromAPI(gameState);
  } else {
    content = generateWordGridFromInput(input, gameState);
  }
  return (
    <div className={styles.body}>
      <div>{content}</div>
    </div>
  );
};

export default InputField;
