import type { NextPage } from "next/types";
import styles from "../../styles/components/multiwordle/Square.module.css";
import { colors } from "../../constants/colors";
import { CharacterStatus } from "../../pages/api/post/multiwordle";

type NextPageProps = {
  character: string;
  color: CharacterStatus;
};

const Square: NextPage<NextPageProps> = ({ color, character }) => {
  return (
    <div className={styles.container} style={{ color: colors[color] }}>
      <div className={styles.character}>{character.toUpperCase()}</div>
    </div>
  );
};

export default Square;
