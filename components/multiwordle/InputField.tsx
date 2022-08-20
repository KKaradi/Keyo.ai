import { NextPage } from "next";
import { Dispatch, SetStateAction, useState } from "react";
import { AnimationKeys } from "../../constants/animationModes";
import { GameMove } from "../../schemas";
import styles from "../../styles/components/multiwordle/InputField.module.css";
import Square from "../misc/Square";

import TutorialDialog from "../dialogs/TutorialDialog";

type InputFieldProps = {
  gameState: GameMove;
  activeSlide: number;
  displayBest: boolean;
  inTutorial: boolean;
  animationMode: AnimationKeys;
  setAnimationMode: Dispatch<SetStateAction<AnimationKeys>>;
  fadeTutorialDialog: [boolean, Dispatch<SetStateAction<boolean>>];
};

const InputField: NextPage<InputFieldProps> = ({
  gameState,
  activeSlide,
  displayBest,
  inTutorial,
  animationMode,
  setAnimationMode,
  fadeTutorialDialog,
}) => {
  return (
    <div className={styles.body}>
      {(gameState.inputs ?? []).map((input, inputIndex) => {
        const backgroundColor = activeSlide === inputIndex ? "#ccc" : undefined;
        const active = activeSlide === inputIndex;
        return (
          <div key={inputIndex}>
            {active ? (
              <TutorialDialog
                inTutorial={false}
                fadeTutorialDialog={fadeTutorialDialog}
              />
            ) : (
              <></>
            )}
            <div
              key={inputIndex}
              className={styles.word}
              style={{ backgroundColor }}
            >
              {input.characters.map(({ character, status }, characterIndex) => {
                const color = input.completed || displayBest ? status : "empty";
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
          </div>
        );
      })}
    </div>
  );
};

export default InputField;
