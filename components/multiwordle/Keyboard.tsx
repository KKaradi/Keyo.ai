import type { NextPage } from "next/types";
import styles from "../../styles/components/multiwordle/Keyboard.module.css";
import BackspaceIcon from "@mui/icons-material/Backspace";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { ReactElement, useEffect, useState } from "react";

const icons: { [key: string]: ReactElement } = {
  ":enter": <KeyboardReturnIcon />,
  ":backspace": <BackspaceIcon />,
};

const defaultKeyboard = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  [":enter", "z", "x", "c", "v", "b", "n", "m", ":backspace"],
];

type KeyboardProps = {
  onPress?: (key: string) => void;
  onSubmit?: () => void;
  keyboard?: string[][];
};

const isUppercaseLetter = (char: string) => {
  return char.length == 1 && Boolean(char.match(/[A-Z]/g));
};

const Keyboard: NextPage<KeyboardProps> = ({ onPress, onSubmit, keyboard }) => {
  const onKeyDown = (key: string) => {
    key = key.toUpperCase().replace(/:/g, "");

    if (key === "ENTER" && onSubmit) onSubmit();

    const isValidKey = key === "BACKSPACE" || isUppercaseLetter(key);
    if (isValidKey && onPress) onPress(key);
  };

  useEffect(() => {
    const listener = ({ key }: KeyboardEvent) => onKeyDown(key);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [onKeyDown]);

  return (
    <div className={styles.container}>
      {(keyboard ?? defaultKeyboard).map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((key, keyIndex) => (
            <button
              className={styles.button}
              onClick={() => onKeyDown(key)}
              key={keyIndex}
            >
              {key.startsWith(":") ? icons[key] : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
