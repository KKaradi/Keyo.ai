import type { NextPage, NextPageContext } from "next";
import { ChangeEventHandler, KeyboardEventHandler, useState } from "react";

import styles from "../../../styles/pages/MultiWordle.module.css";
import Image from "next/image";

import prompts from "../prompts.json";

const hiddenChar = "■";

type Letter = {
  char: string;
  color: typeof yellow | typeof green | typeof gray;
  locked: boolean;
};

const parsePrompt = (prompt: string) => {
  let chunks = prompt.replaceAll(",", "").split(" ");
  chunks = chunks.map((chunk) => chunk.trim());
  return chunks;
};

const hideChunks = (chunks: string[]) => {
  return chunks.map((chunk: string) => hiddenChar.repeat(chunk.length));
};

const rewriteChunks = (
  hiddenChunks: string[],
  previousChunks: Letter[][] | undefined,
  input: string
) => {
  if (previousChunks === undefined) {
    return hiddenChunks.map((chunk: string) => {
      return (input + chunk.slice(input.length)).slice(0, chunk.length);
    });
  } else {
    return hiddenChunks.map((chunk: string, indx) => {
      if (previousChunks[indx][0].locked) {
        return previousChunks[indx]
          .map((letter: Letter) => letter.char)
          .join("");
      }
      return (input + chunk.slice(input.length)).slice(0, chunk.length);
    });
  }
};

const rearrangeHistory = (wordleHistory: Letter[][][]) => {
  if (wordleHistory[0] === undefined) {
    return wordleHistory;
  }
  const rearranged: Letter[][][] = []; //makeArray(wordleHistory[0].length,wordleHistory.length) as Letter[][][];

  for (let i = 0; i < wordleHistory.length; i++) {
    //each guess

    for (let j = 0; j < wordleHistory[i].length; j++) {
      //each word within a guess
      if (rearranged[j] && !wordleHistory[i][j][0].locked) {
        rearranged[j].push(wordleHistory[i][j]);
      } else {
        rearranged.push([wordleHistory[i][j]]);
      }
    }
  }
  return rearranged;
};

const displayChunks = (chunks: string[]) => {
  const jsxElement = chunks.map((chunk, indx) => {
    return (
      <p key={indx} className={styles.paragraph} style={{ textAlign: "left" }}>
        {chunk.split("").map((char, charIndex) => {
          return (
            <span key={charIndex} className={styles.span}>
              {char}
            </span>
          );
        })}
      </p>
    );
  });
  return jsxElement;
};

const yellow = "#c8b653" as const;
const green = "#6ca965" as const;
const gray = "#787c7f" as const;

const getWordleLetters = (
  inputedChunks: string[],
  trueChunks: string[],
  wordleHistory: Letter[][][]
) => {
  const previous = wordleHistory[0];
  const wordleChunks = [] as Letter[][];
  for (let chunkIndx = 0; chunkIndx < trueChunks.length; chunkIndx++) {
    const wordleWord = [] as Letter[];
    for (
      let charIndx = 0;
      charIndx < inputedChunks[chunkIndx].length;
      charIndx++
    ) {
      const inputtedChar = inputedChunks[chunkIndx][charIndx];
      let color = gray as typeof yellow | typeof green | typeof gray;
      if (trueChunks[chunkIndx][charIndx] === inputtedChar) {
        color = green;
      } else if (trueChunks[chunkIndx].includes(inputtedChar)) {
        color = yellow;
      }

      const previousLockState =
        previous !== undefined && previous[chunkIndx][charIndx].locked;

      const letter = {
        char: previousLockState
          ? previous[chunkIndx][charIndx].char
          : inputtedChar,
        color: previousLockState ? previous[chunkIndx][charIndx].color : color,
        locked: previousLockState,
      };

      wordleWord.push(letter);
    }
    const doLock = wordleWord.reduce((prev, curr) => {
      if (!prev) {
        return false;
      }
      return curr.color === green;
    }, true);

    if (doLock) {
      wordleWord.forEach((obj) => {
        obj.locked = true;
      });
    }
    wordleChunks.push(wordleWord);
  }
  return wordleChunks;
};

const displayWordleHistory = (wordleHistory: Letter[][][]) => {
  wordleHistory = rearrangeHistory(wordleHistory);
  const jsxElement = wordleHistory.map((wordleChunks, indx) => {
    return (
      <div key={indx}>
        {wordleChunks.map((wordleWords, wordIndx) => {
          return (
            <p key={wordIndx} className={styles.paragraph}>
              {wordleWords.map((wordleLetter, letterIndx) => {
                return (
                  <span
                    key={letterIndx}
                    className={styles.span}
                    style={{ color: wordleLetter.color }}
                  >
                    {wordleLetter.char}
                  </span>
                );
              })}
            </p>
          );
        })}
        <hr />
      </div>
    );
  });
  return jsxElement;
};

type PromptData = { path: string; prompt: string };
type Prompts = { [key: string]: PromptData };

type MultiWordleProps = {
  hiddenChunks: string[];
  trueChunks: string[];
  promptData: PromptData;
};  

const MultiWordlePage: NextPage<MultiWordleProps> = ({
  hiddenChunks,
  trueChunks,
  promptData,
}) => {
  const [input, setInput] = useState("");
  const [chunks, setChunks] = useState<string[]>(hiddenChunks);

  const [wordleHistory, setWordleHistory] = useState<Letter[][][]>([]);

  const longest = chunks.reduce((prev, curr) => {
    return curr.length > prev ? curr.length : prev;
  }, 0);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const input = event.target.value.slice(0, longest);
    setInput(input);
    setChunks(rewriteChunks(hiddenChunks, wordleHistory[0], input));
  };

  const handleKey: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") return;

    setInput("");
    const newWordleHistory = [
      getWordleLetters(chunks, trueChunks, wordleHistory),
      ...wordleHistory,
    ];
    setWordleHistory(newWordleHistory);

    setChunks(rewriteChunks(hiddenChunks, newWordleHistory[0], ""));
  };

  const size = 500;
  const chunksDisplay = displayChunks(chunks);
  const wordleHistoryDisplay = displayWordleHistory(wordleHistory);

  return (
    <div className={styles.text}>
      <Image height={size / 1.4} width={size} alt="" src={promptData.path} />
      <div style={{ textAlign: "left" }}>
        <input
          value={input}
          style={{ width: "700px" }}
          onChange={handleChange}
          onKeyDown={handleKey}
        />
        <div className={styles.wrapper}>
          <div>{chunksDisplay}</div>
          <div>{wordleHistoryDisplay}</div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: NextPageContext) => {
  let { type } = context.query;
  if (!(type && !Array.isArray(type) && type in prompts)) type = "shrine";

  const promptData = (prompts as Prompts)[type];

  const trueChunks = parsePrompt(promptData.prompt);
  const hiddenChunks = hideChunks(trueChunks);

  const props: MultiWordleProps = { trueChunks, hiddenChunks, promptData };
  return { props };
};

export default MultiWordlePage;
