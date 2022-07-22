import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import { ReturnGameMode } from "../../pages/api/post/multiwordle";
import Square from "./Square";
import React from 'react';

type InputFieldProps = {
  gameState: ReturnGameMode;
  previousGameState: ReturnGameMode;
  newDataFlag: boolean;
};

// type InputFieldProps = {
//   state:{
//     gameStateStack: ReturnGameMode[];
//     gameState: ReturnGameMode;
//     newDataFlag: boolean;
//   }
// }
const cellSize = 32;

const InputField: NextPage<InputFieldProps> = React.memo(function InputField ({ /*state*/gameState, previousGameState, newDataFlag }) {
  gameState = newDataFlag?   previousGameState:gameState;
  //const gameState = state.newDataFlag?state.gameStateStack[0]:state.gameState;
  // console.log(state)
  return (
    <div className={styles.body}>
      <div>
        {gameState.inputs.map((input, inputIndex) => {
          return (
            <div key={inputIndex} className={styles.word} >
              {input.characters.map((character, characterIndex) => {
                return (
                  <a href={`#slide-${inputIndex + 1}`} key={characterIndex}>
                    <Square
                      key={characterIndex}
                      character={character.character}
                      color={input.completed || newDataFlag?character.status:'empty' }
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
});

export default InputField;
