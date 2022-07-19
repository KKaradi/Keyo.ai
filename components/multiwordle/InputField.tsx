import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import { ReturnGameMode } from "../../pages/api/post/multiwordle";
import { Dispatch, SetStateAction } from "react";

type InputFieldProps = {
  input: string;
  gameState: ReturnGameMode;
  newDataFlag: boolean;
  setNewDataFlag: Dispatch<SetStateAction<boolean>>;
};

const cellSize = 35;

const colorMap = {
    'gray': '#787c7f',
    'green': '#6ca965',
    'yellow': '#c8b653',
    'empty': '#FFFFFF',
}

function applyInput(input: string, gameState: ReturnGameMode) {
  for (const word of gameState.inputs) {
    if (word.completed) {
      continue;
    }
    word.characters.forEach((character, indx) => {
      character.character = input.charAt(indx);
    });
  }
}

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
                style={{ height: `${cellSize}px`, width: `${cellSize}px` ,backgroundColor: colorMap[character.status]}}
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
  applyInput(input, gameState);

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
              style={{ height: `${cellSize}px`, width: `${cellSize}px` }}
            >
              {character.character}
            </div>
          );
        })}
      </div>
    );
  });

  //   input.split(",").forEach((word, indx) => {
  //     if (indx != 0) {
  //       inputArray.push(" ");
  //     }
  //     inputArray.push(word);
  //   });

  //   return inputArray.map((split, idx) => {
  //     return (
  //       <div
  //         key={idx}
  //         className={styles.word}
  //         style={{ height: `${cellSize}px`, width: `${split.length * 40}px` }}
  //       >
  //         {split.split("").map((letter, idx) => {
  //           return (
  //             <div
  //               key={idx}
  //               className={styles.cell}
  //               style={{ height: `${cellSize}px`, width: `${cellSize}px` }}
  //             >
  //               {letter}
  //             </div>
  //           );
  //         })}
  //       </div>
  //     );
  //   });
}

const InputField: NextPage<InputFieldProps> = ({
  input,
  gameState,
  newDataFlag,
  setNewDataFlag,
}) => {
  let content: JSX.Element[] = [];
  if(newDataFlag) {
    console.log('dataflag true')
    content = generateWordGridFromAPI(gameState);
  }else{
    content = generateWordGridFromInput(input, gameState);
  }
  return <div className={styles.body}>{content}</div>;
};

export default InputField;
