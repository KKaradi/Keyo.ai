import { NextPage } from "next";
import { Dispatch, SetStateAction, useState } from "react";
import { GameMove, Word } from "../../schemas";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import Square from "../misc/Square";

type InputFieldProps = {
  gameState: GameMove;
  activeSlide: number;
  bestGuesses?: Word[];
  isAnimated: boolean;
  setIsAnimated: Dispatch<SetStateAction<boolean>>;
};

const InputField: NextPage<InputFieldProps> = ({
  gameState,
  activeSlide,
  bestGuesses,
  isAnimated,
  setIsAnimated,
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
                    <Square
                      character={character}
                      color={color}
                      isAnimated={isAnimated}
                      setIsAnimated={setIsAnimated}
                    />
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
