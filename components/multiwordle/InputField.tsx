import { NextPage } from "next";
import { Dispatch, SetStateAction, useState } from "react";
import { AnimationKeys } from "../../constants/animationModes";
import { GameMove, Word } from "../../schemas";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import Square from "../misc/Square";

type InputFieldProps = {
  gameState: GameMove;
  activeSlide: number;
  bestGuesses?: Word[];
  animationMode: AnimationKeys;
  setAnimationMode: Dispatch<SetStateAction<AnimationKeys>>;
};

const InputField: NextPage<InputFieldProps> = ({
  gameState,
  activeSlide,
  bestGuesses,
  animationMode,
  setAnimationMode,
}) => {
  return (
    <div className={styles.body}>
      {(bestGuesses ?? gameState.inputs ?? []).map((input, inputIndex) => {
        const backgroundColor = activeSlide === inputIndex ? "#ccc" : undefined;
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
                      animationMode={animationMode}
                      setAnimationMode={setAnimationMode}
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
