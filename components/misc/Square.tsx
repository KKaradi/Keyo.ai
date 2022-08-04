import type { NextPage } from "next/types";
import styles from "../../styles/components/misc/Square.module.css";
import { colors } from "../../constants/colors";
import { CharacterStatus } from "../../schemas";
import { Dispatch, SetStateAction, useState } from "react";
import { AnimationKeys, animationModes } from "../../constants/animationModes";

type NextPageProps = {
  character: string;
  color: CharacterStatus;
  animationMode?: AnimationKeys;
  setAnimationMode?: Dispatch<SetStateAction<AnimationKeys>> | undefined;
};

const Square: NextPage<NextPageProps> = ({
  character,
  color,
  animationMode,
  setAnimationMode,
}) => {
  return (
    <div
      className={animationModes[animationMode ?? "none"]}
      style={{
        backgroundColor: colors[color],
      }}
      onAnimationEnd={() => {
        if (setAnimationMode !== undefined) setAnimationMode("none");
      }}
    >
      <div className={styles.character}>{character.toUpperCase()}</div>
    </div>
  );
};

export default Square;
