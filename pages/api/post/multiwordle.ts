import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../helpers";
import schedule from "../../../live/schedule.json";

export type CharacterStatus = "green" | "yellow" | "gray" | "empty";
export type GameStatus = "new" | "started" | "finished";

export type Stats = {
  totalChars: number;
  greens: number;
  yellows: number;
  grays: number;
  totalWords: number;
  hitwords: number;
  level: number;
};

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
  stats: Stats | undefined;
  nextGameDate: string | undefined;
};

export type ReturnGameMove = {
  gameId?: number;
  summary?: number[];
  inputs?: ReturnWord[];
  imagePath?: string;
  gameStatus?: GameStatus;
  stats?: Stats;
  nextGameDate?: string;
};

export type ReturnWord = {
  completed: boolean;
  characters: ReturnCharacter[];
};

export type ReturnCharacter = {
  character: string;
  status: CharacterStatus;
};

export type ErrorMessage = { message: string };
export type Response = AcceptGameMove | ErrorMessage;

function applyLevel(stats: Stats): void {
  if (stats.hitwords >= 2) {
    stats.level = 0;
  } else if (stats.hitwords == 1) {
    stats.level = 1;
  } else if (stats.greens + stats.yellows / stats.totalChars >= 0.66) {
    stats.level = 2;
  } else if (stats.greens + stats.yellows / stats.totalChars >= 0.33) {
    stats.level = 3;
  } else {
    stats.level = 4;
  }
}

function pullPrompt(): {
  prompt: string | undefined;
  imagePath: string | undefined;
  gameId: number | undefined;
  nextGameDate: string | undefined;
} {
  let prompt;
  let imagePath;
  let gameId;
  let nextGameDate;
  const now = Date.now();
  for (let i = 0; i < schedule.length; i++) {
    if (
      new Date(schedule[i].start_date).getTime() <= now &&
      now <= new Date(schedule[i].end_date).getTime()
    ) {
      prompt = schedule[i]?.prompt;
      imagePath = schedule[i]?.image_path;
      gameId = i;
      nextGameDate = schedule[i + 1]?.start_date;
      break;
    }
  }
  return { prompt, imagePath, gameId, nextGameDate };
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
  promptSplits: string[],
  nextGameDate: string | undefined
): AcceptGameMove {
  return {
    gameId,
    gameStatus: "started",
    inputs: promptSplits.map(splitToEmptys),
    summary: promptSplits.map((split) => split.length),
    imagePath: imagePath,
    error: false,
    stats: undefined,
    nextGameDate,
  } as AcceptGameMove;
}

function processStartedGame(
  gameMove: AcceptGameMove,
  res: NextApiResponse<Response>,
  gameId: number,
  promptSplits: string[]
): boolean {
  if (gameMove.gameId === undefined) {
    res.status(400).json({ message: "GameId is undefined" });
    return false;
  }

  if (gameMove.gameId != gameId) {
    if (!schedule[gameMove.gameId]) {
      res.status(400).json({ message: "Invalid GameId" });
      return false;
    }
    promptSplits = schedule[gameMove.gameId].prompt.split(" ");
  }

  if (gameMove.summary === undefined) {
    gameMove.summary = promptSplits.map((split) => split.length);
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

  const stats: Stats = {
    totalChars: 0,
    greens: 0,
    yellows: 0,
    grays: 0,
    totalWords: 0,
    hitwords: 0,
    level: 0,
  };

  gameMove["stats"] = stats;
  for (let indx = 0; indx < inputs.length; indx++) {
    if (!processSingleWord(inputs[indx], promptSplits[indx], res, stats)) {
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
  res: NextApiResponse<Response>,
  stats: Stats
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
      res.status(400).json({
        message: "Character is undefined or not a single character.",
      });
      return false;
    }
  }
  if (handleWordle(characters as ReturnCharacter[], promptSplit, stats)) {
    word.completed = true;
  }

  applyLevel(stats);
  return true;
}

/**
 *
 * @param characters
 * @param promptSplit
 * @returns whether the word was completed
 */
function handleWordle(
  characters: ReturnCharacter[],
  promptSplit: string,
  stats: Stats
): boolean {
  stats.totalWords += 1;
  stats.totalChars += characters.length;
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
      stats.greens += 1;
    } else {
      completedFlag = false;
    }
  }

  if (completedFlag) {
    stats.hitwords += 1;
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
      stats.yellows += 1;
    } else {
      characters[indx].status = "gray";
      stats.grays += 1;
    }
  }
  return false;
}

export default function Handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only Post Requests" });

  if (!authenticate(req))
    return res.status(405).json({ message: "Authentication Error" });

  const gameMove = req.body as AcceptGameMove;
  const { prompt, imagePath, gameId, nextGameDate } = pullPrompt();

  if (prompt === undefined || imagePath === undefined || gameId === undefined) {
    res.status(400).json({ message: "No game session is currently running" });
    return;
  }

  const splits = prompt.split(" ");

  if (!gameMove.gameStatus) {
    res.status(400).json({
      message: "Incorrect parameters: must supply game status.",
    });
  } else if (gameMove.gameStatus === "new") {
    const newGame = generateNewGame(gameId, imagePath, splits, nextGameDate);
    return res.status(200).json(newGame);
  } else if (gameMove.gameStatus === "finished") {
    res.status(400).json({ message: "Game is already finished." });
  } else if (gameMove.gameStatus === "started") {
    if (processStartedGame(gameMove, res, gameId, splits)) {
      res.status(200).json(gameMove);
    }
  } else {
    res.status(400).json({
      message: "Game status is invalid. Must be new, started, finished",
    });
  }
}
