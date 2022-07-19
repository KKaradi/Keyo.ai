import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, response } from "../helpers";

type CharacterStatus = "green" | "yellow" | "gray" | "empty";
type GameStatus = "new" | "started" | "finished";

export type AcceptCharacter = {
  character: string | undefined;
  status: CharacterStatus | undefined;
};

export type AcceptWord = {
  completed: boolean | undefined;
  characters: AcceptCharacter[] | undefined;
};
export type AcceptGameMove = {
  summary: number[] | undefined;
  gameId: number | undefined;
  inputs: AcceptWord[] | undefined;
  gameStatus: GameStatus | undefined;
};

export type ReturnGameMode = {
  gameId: number;
  summary: number[];
  inputs: ReturnWord[];
  gameStatus: GameStatus;
};

export type ReturnWord = {
  completed: boolean;
  characters: ReturnCharacter[];
};

export type ReturnCharacter = {
  character: string;
  status: CharacterStatus;
};

type ErrorMessage = { message: string };
type Response = AcceptGameMove | ErrorMessage;
const prompt =
  "a nighttime cityscape of tokyo harbor chillwave style trending on artstation";
const gameId = 1;

function splitToEmptys(split: string): AcceptWord {
  return {
    completed: false,
    characters: split.split("").map(() => {
      return { status: "empty", character: " " };
    }),
  } as AcceptWord;
}

function generateNewGame(gameId: number, splits: string[]): AcceptGameMove {
  return {
    gameId: gameId,
    gameStatus: "started",
    inputs: splits.map(splitToEmptys),
    summary: splits.map((split) => split.length),
  } as AcceptGameMove;
}

function processStartedGame(
  gameMove: AcceptGameMove,
  res: NextApiResponse<Response>,
  splits: string[]
): boolean {
  if (gameMove.gameId != gameId) {
    res
      .status(400)
      .json({ message: "Incorrect game id. Current game id is " + gameId });
    return false;
  }
  const { inputs } = gameMove;
  if (!inputs) {
    res.status(400).json({ message: "Game inputs undefined" });
    return false;
  }
  if (inputs.length != splits.length) {
    res.status(400).json({
      message:
        "Number of inputted words is incorrect: Expected " +
        splits.length +
        " but got " +
        inputs.length,
    });
    return false;
  }

  for (let indx = 0; indx < inputs.length; indx++) {
    if (!processSingleWord(inputs[indx], splits[indx], res)) {
      return false;
    }
  }

  if (inputs.every((input) => input.completed)) {
    gameMove.gameStatus = "finished";
  }

  return true;
}

function processSingleWord(
  word: AcceptWord,
  split: string,
  res: NextApiResponse<Response>
): boolean {
  const { characters, completed } = word;
  if (!characters) {
    res.status(400).json({ message: "Word characters are undefined" });
    return false;
  }
  if (completed === undefined) {
    res.status(400).json({ message: "Word completion is undefined" });
    return false;
  }
  if (characters.length != split.length) {
    res.status(400).json({
      message:
        "Number of inputted characters is incorrect: Expected " +
        split.length +
        " but got " +
        characters.length,
    });
    return false;
  }
  if (completed) {
    return true;
  }
  for (const character of characters) {
    delete character.status;
    if (character.character === undefined || character.character.length != 1) {
      res
        .status(400)
        .json({ message: "Character is undefined or not a single character." });
      return false;
    }
  }
  if (handleWorlde(characters as ReturnCharacter[], split)) {
    word.completed = true;
  }
  return true;
}

/**
 *
 * @param characters
 * @param split
 * @returns whether the word was completed
 */
function handleWorlde(characters: ReturnCharacter[], split: string): boolean {
  const splitMap = new Map<string, number>();
  let completedFlag = true;

  for (const character of split.split("")) {
    splitMap.set(character, (splitMap.get(character) ?? 0) + 1);
  }

  for (let indx = 0; indx < characters.length; indx++) {
    if (characters[indx].character === split.charAt(indx)) {
      splitMap.set(
        characters[indx].character,
        splitMap.get(characters[indx].character) ?? 0 - 1
      );
      characters[indx].status = "green";
    } else {
      completedFlag = false;
    }
  }

  if (completedFlag) {
    return true;
  }

  for (let indx = 0; indx < characters.length; indx++) {
    if (characters[indx].status === "green") {
      continue;
    }
    if (splitMap.get(characters[indx].character) ?? 0 >= 1) {
      characters[indx].status = "yellow";
      splitMap.set(
        characters[indx].character,
        splitMap.get(characters[indx].character) ?? 0 - 1
      );
    } else {
      characters[indx].status = "gray";
    }
  }
  return false;
}

export default function Handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") return response(res, "onlyPost");

  if (!authenticate(req)) return response(res, "authError");

  const gameMove = req.body as AcceptGameMove;

  const splits = prompt.split(" ");

  if (!gameMove.gameStatus) {
    res
      .status(400)
      .json({ message: "Incorrect parameters: must supply game status." });
  } else if (gameMove.gameStatus === "new") {
    const newGame = generateNewGame(gameId, splits);
    return res.status(200).json(newGame);
  } else if (gameMove.gameStatus === "finished") {
    res.status(400).json({ message: "Game is already finished." });
  } else if (gameMove.gameStatus === "started") {
    if (gameMove.summary === undefined) {
      res.status(400).json({ message: "Game summary is undefined." });
    } else if (processStartedGame(gameMove, res, splits)) {
      res.status(200).json(gameMove);
    }
  } else {
    res.status(400).json({
      message: "Game status is invalid. Must be new, started, finished",
    });
  }
}
