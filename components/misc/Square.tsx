import type { NextPage } from "next/types";
import styles from "../../styles/components/misc/Square.module.css";
import { colors } from "../../constants/colors";
import { CharacterStatus } from "../../schemas";

type NextPageProps = {
  character: string;
  color: CharacterStatus;
};

const Square: NextPage<NextPageProps> = ({ character, color }) => {
  return (
    <div
      className={styles.container}
      style={{ backgroundColor: colors[color] }}
    >
      <div className={styles.character}>{character.toUpperCase()}</div>
    </div>
  );
};

export default Square;
