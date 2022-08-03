import type { NextPage } from "next/types";
import styles from "../../styles/components/misc/Square.module.css";
import { colors } from "../../constants/colors";
import { CharacterStatus } from "../../schemas";
import { Dispatch, SetStateAction, useState } from "react";

type NextPageProps = {
  character: string;
  color: CharacterStatus;
  isAnimated: boolean;
  setIsAnimated: Dispatch<SetStateAction<boolean>> | undefined;
};

const Square: NextPage<NextPageProps> = ({
  character,
  color,
  isAnimated,
  setIsAnimated,
}) => {
  return (
    <div
      className={isAnimated ? styles.animatedContainer : styles.container}
      style={{ backgroundColor: colors[color] }}
      onAnimationEnd={() => {
        if (setIsAnimated !== undefined) setIsAnimated(false);
      }}
    >
      <div className={styles.character}>{character.toUpperCase()}</div>
    </div>
  );
};

export default Square;
