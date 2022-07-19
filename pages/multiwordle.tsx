import type { NextPage, NextPageContext } from "next";
import Image from "next/image";
import { post, get } from "../helpers";
import { AcceptGameMove, ReturnGameMode } from "./api/post/multiwordle";
import styles from "../styles/pages/MultiWordle.module.css";
import InputField from "../components/multiwordle/InputField";
import ImageFrame from "../components/multiwordle/ImageFrame";
import TextField from "@mui/material/TextField/TextField";
import {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

function applyInput(
  input: string,
  gameStateStack: ReturnGameMode[],
  setGameStateStack: Dispatch<SetStateAction<ReturnGameMode[]>>
) {
  for (const word of gameStateStack[0].inputs) {
    if (word.completed) {
      continue;
    }
    word.characters.forEach((character, indx) => {
      const charAt = input.charAt(indx);
      character.character = charAt === "" ? " " : charAt;
    });
  }

  setGameStateStack(gameStateStack);
}

const MultiWordlePage: NextPage<{ initalGameState: ReturnGameMode }> = ({
  initalGameState: initalGameState,
}) => {
  //const [gameState, setGameState] = useState(initalGameState);
  const [userInput, setUserInput] = useState("");
  const [newDataFlag, setNewDataFlag] = useState(true);
  const [gameStateStack, setGameStateStack] = useState<ReturnGameMode[]>([initalGameState]);


  const handleUserKeyPress = useCallback(
    async (event: { key: string; keyCode: number }) => {
      const { key, keyCode } = event;
      let nextUserInput = "";
      if (keyCode >= 65 && keyCode <= 90) {
        nextUserInput = `${userInput}${key}`;
        setUserInput(nextUserInput);
        setNewDataFlag(false);
        applyInput(nextUserInput, gameStateStack, setGameStateStack);
      } else if (keyCode === 8) {
        nextUserInput = userInput.slice(0, -1);
        setUserInput(nextUserInput);
        setNewDataFlag(false);
        applyInput(nextUserInput, gameStateStack, setGameStateStack);
      } else if (keyCode === 13) {
        setUserInput(nextUserInput);
        const res = await post(
          "http://localhost:3000/api/post/multiwordle",
          gameStateStack[0]
        );
        setGameStateStack([await res.json(), ...gameStateStack, ]);
        setNewDataFlag(true);
        return;
      }
    },
    [userInput, gameStateStack]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  return (
    <div className={styles.body}>
      <div className={styles.half}>
        <ImageFrame path="/prototypes/multiwordle/a_nighttime_cityscape_of_tokyo_harbor_chillwave_style_trending_on_artstation.png"></ImageFrame>
        {/* <input type='textfield' value={input} onChange={handleChange}/> */}
        <InputField
          input={userInput}
          gameState={gameStateStack[0]}
          newDataFlag={newDataFlag}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async (context: NextPageContext) => {

  const dummyInput = [
    "a",
    "nighttime",
    "cityscape",
    "of",
    "hanoi",
    "oceans",
    "chillwave",
    "style",
    "trending",
    "on",
    "artstation",
  ];

  let gameState: AcceptGameMove = {
    gameId: 1,
    gameStatus: "started",
    summary: dummyInput.map((word) => word.length),
    inputs: [
      {
        characters: dummyInput[0].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[1].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[2].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[3].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[4].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[5].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[6].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[7].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[8].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[9].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
      {
        characters: dummyInput[10].split("").map((char) => {
          return { character: char, status: undefined };
        }),
        completed: false,
      },
    ],
  };

  gameState = {
      gameStatus: "new",
      gameId: undefined,
      summary: undefined,
      inputs: undefined
    }

  const res = await post(
    "http://localhost:3000/api/post/multiwordle",
    gameState
  );

  const initalGameState = await res.json();
  return { props: { initalGameState } };
};
export default MultiWordlePage;
