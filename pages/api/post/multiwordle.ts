import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, response } from "../helpers";
import schedule from "../../../schedule.json";
import {
  Character,
  GameData,
  GameDataSchema,
  GameMove,
  GameMoveSchema,
  GameStartSchema,
  Stats,
  Word,
} from "../../../schemas";
import { z } from "zod";
import prisma from "../../../lib/prisma";
import { Color } from "@prisma/client";

export type ErrorMessage = { message: string };
export type Response = GameMove | ErrorMessage;

function pullPrompt(): GameData | undefined {
  const now = Date.now();
  for (let i = 0; i < schedule.length; i++) {
    const afterStart = new Date(schedule[i].start_date).getTime() <= now;
    const beforeEnd = now <= new Date(schedule[i].end_date).getTime();
    if (afterStart && beforeEnd) {
      return {
        prompt: schedule[i].prompt,
        imagePath: schedule[i].image_path,
        gameId: i,
        nextGameDate: schedule[i + 1].start_date,
      };
    }
  }
}

function splitToEmptys(promptSplits: string): Word {
  return {
    completed: false,
    characters: promptSplits.split("").map(() => {
      return { status: "empty", character: " " };
    }),
  } as Word;
}

export function generateNewGame(
  gameId: number,
  imagePath: string,
  promptSplits: string[],
  nextGameDate: string
): GameMove {
  return {
    gameId,
    gameStatus: "started",
    inputs: promptSplits.map(splitToEmptys),
    summary: promptSplits.map((split) => split.length),
    imagePath: imagePath,
    stats: undefined,
    nextGameDate,
  };
}

function processStartedGame(
  gameMove: GameMove,
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
    hitWords: 0,
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
  word: Word,
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
    if (character.character === undefined || character.character.length != 1) {
      res.status(400).json({
        message: "Character is undefined or not a single character.",
      });
      return false;
    }
  }
  if (handleWordle(characters as Character[], promptSplit, stats)) {
    word.completed = true;
    stats.hitWords++;
  }

  return true;
}

/**
 *
 * @param characters
 * @param promptSplit
 * @returns whether the word was completed
 */
function handleWordle(
  characters: Character[],
  promptSplit: string,
  stats: Stats
): boolean {
  stats.totalWords += 1;
  stats.totalChars += characters.length;
  const promptSplitMap = new Map<string, number>();

  for (const character of promptSplit.split("")) {
    promptSplitMap.set(character, (promptSplitMap.get(character) ?? 0) + 1);
  }

  const greens: number[] = [];

  const completed = characters.reduce((prev, { character }, index) => {
    if (character === promptSplit.charAt(index)) {
      promptSplitMap.set(character, (promptSplitMap.get(character) ?? 0) - 1);
      greens.push(index);
      return prev;
    }
    return false;
  }, true);

  characters.forEach(({ character }, index) => {
    if (greens.includes(index)) {
      characters[index].status = "green";
      stats.greens += 1;
    } else if ((promptSplitMap.get(character) ?? 0) >= 1) {
      characters[index].status = "yellow";
      promptSplitMap.set(character, (promptSplitMap.get(character) ?? 0) - 1);
      stats.yellows += 1;
    } else {
      characters[index].status = "gray";
      stats.grays += 1;
    }
  });

  return completed;
}

const addGuessToDatabase = async (gameMove: GameMove, prompt: string) => {
  const colors: Color[] = [];
  const letters: string[] = [];

  gameMove.inputs.forEach((input) =>
    input.characters.forEach(({ status, character }) => {
      colors.push(status);
      letters.push(character);
    })
  );

  const { account, gameId, gameStatus, nextGameDate, imagePath } = gameMove;
  const game = { colors, letters, gameId, gameStatus, prompt, imagePath };

  const address = account?.type === "wallet" ? account.id : undefined;
  const email = account?.type === "gmail" ? account.id : undefined;

  await prisma.guess.create({
    data: { address, email, nextGameDate, ...game },
  });
};

export const RequestSchema = z.union([GameMoveSchema, GameStartSchema]);
export type Request = z.infer<typeof RequestSchema>;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") return response(res, "onlyPost");
  if (!authenticate(req)) return response(res, "authError");

  const parsedBody = RequestSchema.safeParse(req.body);
  if (!parsedBody.success) return response(res, "incorrectParams");

  const parsedPromptData = GameDataSchema.safeParse(pullPrompt());
  if (!parsedPromptData.success) return response(res, "internalError");

  const gameMove = parsedBody.data;
  const { prompt, gameId, imagePath, nextGameDate } = parsedPromptData.data;

  const splits = prompt.split(" ");

  if (gameMove.gameStatus === "new") {
    const newGame = generateNewGame(gameId, imagePath, splits, nextGameDate);
    return res.status(200).json(newGame);
  } else if (gameMove.gameStatus === "started") {
    if (processStartedGame(gameMove, res, gameId, splits)) {
      addGuessToDatabase(gameMove, prompt);
      return res.status(200).json(gameMove);
    }
  } else if (gameMove.gameStatus === "finished") {
    return res.status(400).json({ message: "Game is already finished." });
  }
}
