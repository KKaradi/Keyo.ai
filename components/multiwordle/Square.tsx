import type { NextPage } from "next/types";
import styles from "../../styles/components/multiwordle/Square.module.css";
import { colors } from "../../constants/colors";
import { CharacterStatus } from "../../pages/api/post/multiwordle";
import { CSSProperties } from "react";

type NextPageProps = {
  character: string;
  color: CharacterStatus;
  width: string;
  height: string;
  style?: CSSProperties;
};

const Square: NextPage<NextPageProps> = ({
  character,
  color,
  width,
  height,
  style,
}) => {
  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors[color], width, height, ...style }}
    >
      <div className={styles.character}>{character.toUpperCase()}</div>
    </div>
  );
};

export default Square;
