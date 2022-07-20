import type { NextPage } from "next/types";
import styles from "../../styles/components/multiwordle/Square.module.css";
import { colors } from "../../constants/colors";
import { CharacterStatus } from "../../pages/api/post/multiwordle";

type NextPageProps = {
  character: string;
  color: CharacterStatus;
  width: string;
  height: string;
};

const Square: NextPage<NextPageProps> = ({ character, color, width, height }) => {
  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors[color], width:width, height:height }}
    >
      <div className={styles.character}>{character.toUpperCase()}</div>
    </div>
  );
};

export default Square;
