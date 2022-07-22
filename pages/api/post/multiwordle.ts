import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, response } from "../helpers";
import schedule from "../../../live/schedule.json";
export type CharacterStatus = "green" | "yellow" | "gray" | "empty";
export type GameStatus = "new" | "started" | "finished";

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
  imagePath: string | undefined;
  gameStatus: GameStatus | undefined;
};

export type ReturnGameMode = {
  gameId: number;
  summary: number[];
  inputs: ReturnWord[];
  imagePath: string;
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

function pullPrompt(): {
  prompt: string | undefined;
  imagePath: string | undefined;
  gameId: number | undefined;
} {
  let prompt;
  let imagePath;
  let gameId;
  const now = Date.now();
  for (let i = 0; i < schedule.length; i++) {
    if (
      new Date(schedule[i].start_date).getTime() <= now &&
      now <= new Date(schedule[i].end_date).getTime()
    ) {
      prompt = schedule[i].prompt;
      imagePath = schedule[i].image_path;
      gameId = i;
      break;
    }
  }
  return { prompt, imagePath, gameId };
}

function splitToEmptys(promptSplits: string): AcceptWord {
  return {
    completed: false,
    characters: promptSplits.split("").map(() => {
      return { status: "empty", character: " " };
    }),
  } as AcceptWord;
}

function generateNewGame(
  gameId: number,
  imagePath: string,
  promptSplits: string[]
): AcceptGameMove {
  return {
    gameId: gameId,
    gameStatus: "started",
    inputs: promptSplits.map(splitToEmptys),
    summary: promptSplits.map((split) => split.length),
    imagePath: imagePath,
  } as AcceptGameMove;
}

function processStartedGame(
  gameMove: AcceptGameMove,
  res: NextApiResponse<Response>,
  gameId: number,
  imagePath: string,
  promptSplits: string[]
): boolean {
  if (gameMove.gameId != gameId) {
    res.status(400).json({
      message: `Incorrect game id. Current game id is ${gameId}. A new game may have been started in the time the game was played.`,
    });
    return false;
  }

  if (gameMove.summary === undefined) {
    gameMove.summary = promptSplits.map((split) => split.length);
  }

  if (gameMove.imagePath === undefined) {
    gameMove.imagePath = imagePath;
  }

  const { inputs } = gameMove;
  if (!inputs) {
    res.status(400).json({ message: "Game inputs undefined" });
    return false;
  }
  if (inputs.length != promptSplits.length) {
    res.status(400).json({
      message:
        "Number of inputted words is incorrect: Expected " +
        promptSplits.length +
        " but got " +
        inputs.length,
    });
    return false;
  }

  for (let indx = 0; indx < inputs.length; indx++) {
    if (!processSingleWord(inputs[indx], promptSplits[indx], res)) {
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
  promptSplit: string,
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
  if (characters.length != promptSplit.length) {
    res.status(400).json({
      message:
        "Number of inputted characters is incorrect: Expected " +
        promptSplit.length +
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
  if (handelWorlde(characters as ReturnCharacter[], promptSplit)) {
    word.completed = true;
  }
  return true;
}

/**
 *
 * @param characters
 * @param promptSplit
 * @returns whether the word was completed
 */
function handelWorlde(
  characters: ReturnCharacter[],
  promptSplit: string
): boolean {
  const promptSplitMap = new Map<string, number>();
  let completedFlag = true;

  for (const character of promptSplit.split("")) {
    promptSplitMap.set(character, (promptSplitMap.get(character) ?? 0) + 1);
  }

  for (let indx = 0; indx < characters.length; indx++) {
    if (characters[indx].character === promptSplit.charAt(indx)) {
      promptSplitMap.set(
        characters[indx].character,
        (promptSplitMap.get(characters[indx].character) ?? 0) - 1
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
    if ((promptSplitMap.get(characters[indx].character) ?? 0) >= 1) {
      characters[indx].status = "yellow";
      promptSplitMap.set(
        characters[indx].character,
        (promptSplitMap.get(characters[indx].character) ?? 0) - 1
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
  const { prompt, imagePath, gameId } = pullPrompt();

  if (prompt === undefined || imagePath === undefined || gameId === undefined) {
    res.status(400).json({ message: "No game session is currently running" });
    return;
  }

  const splits = prompt.split(" ");

  if (!gameMove.gameStatus) {
    res
      .status(400)
      .json({ message: "Incorrect parameters: must supply game status." });
  } else if (gameMove.gameStatus === "new") {
    const newGame = generateNewGame(gameId, imagePath, splits);
    return res.status(200).json(newGame);
  } else if (gameMove.gameStatus === "finished") {
    res.status(400).json({ message: "Game is already finished." });
  } else if (gameMove.gameStatus === "started") {
    if (processStartedGame(gameMove, res, gameId, imagePath, splits)) {
      res.status(200).json(gameMove);
    }
  } else {
    res.status(400).json({
      message: "Game status is invalid. Must be new, started, finished",
    });
  }
}
