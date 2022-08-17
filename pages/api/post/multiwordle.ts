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
  Account,
} from "../../../schemas";
import { z } from "zod";
import prisma from "../../../lib/prisma";
import { Session } from "@prisma/client";

export type ErrorMessage = { message: string };
export type Response = GameMove | GameMove[] | ErrorMessage;

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

export async function generateNewGame(
  account: Account,
  gameId: number,
  imagePath: string,
  promptSplits: string[],
  nextGameDate: string,
  addNewSession: boolean
): Promise<GameMove> {
  if (addNewSession)
    await prisma.session.create({
      data: { completed: false, accountId: account.id, gameId },
    });

  return {
    gameId,
    text: "",
    gameStatus: "started",
    inputs: promptSplits.map(splitToEmptys),
    summary: promptSplits.map((split) => split.length),
    imagePath: imagePath,
    stats: undefined,
    nextGameDate,
    account,
    attempt: 0,
  };
}

async function processStartedGame(
  gameMove: GameMove,
  gameId: number,
  promptSplits: string[]
): Promise<string | true> {
  if (gameMove.gameId === undefined) return "Game ID is undefined";

  if (gameMove.gameId != gameId) {
    if (!schedule[gameMove.gameId]) return "Invalid GameId";
    promptSplits = schedule[gameMove.gameId].prompt.split(" ");
  }

  if (gameMove.summary === undefined) {
    gameMove.summary = promptSplits.map((split) => split.length);
  }

  const { inputs } = gameMove;
  if (!inputs) return "Game inputs undefined";

  if (inputs.length != promptSplits.length) {
    return `Number of inputted words is incorrect: Expected ${promptSplits.length} but got ${inputs.length}`;
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
    const message = processSingleWord(inputs[indx], promptSplits[indx], stats);
    if (typeof message === "string") return message;
  }

  if (inputs.every((input) => input.completed)) {
    gameMove.gameStatus = "finished";
    await addGlobalRank(gameMove);
  }
  // console.log("in", gameMove.globalPosition);
  gameMove.attempt += 1;

  return true;
}

function processSingleWord(
  word: Word,
  promptSplit: string,
  stats: Stats
): string | true {
  const { characters, completed } = word;
  if (!characters) return "Word characters are undefined";
  if (completed === undefined) return "Word completion is undefined";

  if (characters.length != promptSplit.length) {
    return `Number of inputted characters is incorrect: Expected ${promptSplit.length}" but got ${characters.length}`;
  }

  if (completed) return true;

  for (const character of characters) {
    if (character.character === undefined || character.character.length != 1) {
      return "Character is undefined or not a single character.";
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

const addGuessToDatabase = async (
  { text, account, attempt, gameStatus }: GameMove,
  gameId: number
) => {
  const session = await prisma.session.findFirstOrThrow({
    where: { gameId, accountId: account.id },
  });

  if (gameStatus === "finished") {
    await prisma.session.update({
      where: { id: session.id },
      data: { completed: true, timeCompleted: new Date() },
    });
  }

  await prisma.guess.create({ data: { text, sessionId: session.id, attempt } });
};

const createAccount = async (): Promise<Account> => {
  const { id } = await prisma.account.create({ data: {} });
  return { id, address: undefined, email: undefined };
};

const getAccount = async (id: string) => {
  const res = await prisma.account.findUniqueOrThrow({
    where: { id },
    include: { sessions: true },
  });

  const address = res.address ?? undefined;
  const email = res.email ?? undefined;
  const sessions = res.sessions;

  return { id, address, email, sessions };
};

export const RequestSchema = z.union([GameMoveSchema, GameStartSchema]);
export type Request = z.infer<typeof RequestSchema>;

const sessionToGameStack = async (
  id: string,
  account: Account,
  { nextGameDate, prompt, imagePath, gameId }: GameData
): Promise<GameMove[]> => {
  const guesses = await prisma.guess.findMany({
    where: { sessionId: id },
    orderBy: { attempt: "asc" },
  });

  const promptSplits = prompt.split(" ");

  let lastMove = await generateNewGame(
    account,
    gameId,
    imagePath,
    promptSplits,
    nextGameDate,
    false
  );
  const moves: GameMove[] = [lastMove];

  for (const { text, attempt } of guesses) {
    const lastMoveClone = JSON.parse(JSON.stringify(lastMove)) as GameMove;
    lastMoveClone.text = text;
    lastMoveClone.inputs = lastMoveClone.inputs.map((word) => {
      if (word.completed) return word;
      return {
        completed: false,
        characters: word.characters.map(({ status }, index) => {
          const charAt = text.charAt(index);
          const character = charAt === "" ? " " : charAt;
          return { character, status };
        }),
      };
    });
    await processStartedGame(lastMoveClone, gameId, promptSplits);
    // console.log("gp", lastMoveClone.globalPosition);
    moves.push(lastMoveClone);
    lastMove = lastMoveClone;
  }

  return moves;
};

async function addGlobalRank(gameMove: GameMove) {
  // console.log("called addGlobalRank");
  if (gameMove.gameStatus !== "finished") return;

  const { timeCompleted } = await prisma.session.findFirstOrThrow({
    where: { gameId: gameMove.gameId, accountId: gameMove.account.id },
  });
  if (timeCompleted === null) return;
  gameMove.globalPosition =
    (await prisma.session.count({
      where: { timeCompleted: { lte: timeCompleted } },
    })) + 1;
  // console.log(gameMove.globalPosition);
  // console.log("ranked");
  // console.log(gameMove);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") return response(res, "onlyPost");
  if (!authenticate(req)) return response(res, "authError");

  const parsedPromptData = GameDataSchema.safeParse(pullPrompt());
  if (!parsedPromptData.success) return response(res, "internalError");

  const { prompt, gameId, imagePath, nextGameDate } = parsedPromptData.data;
  const splits = prompt.split(" ");

  const parsedGameStart = GameStartSchema.safeParse(req.body);

  // if new game
  if (parsedGameStart.success) {
    const { userId } = parsedGameStart.data;

    // if cookies stored a user id
    if (userId) {
      const account = await getAccount(userId);

      const pred = (session: Session) => session.gameId === gameId;
      const session = account.sessions.find(pred);

      // if the user actually has a session with the current game
      if (session) {
        const gameData = parsedPromptData.data;
        const moves = await sessionToGameStack(session.id, account, gameData);
        return res.status(200).json(moves);
      }
    }

    const account = await createAccount();
    const args = [account, gameId, imagePath, splits, nextGameDate] as const;
    const newGame = await generateNewGame(...args, true);

    return res.status(200).json(newGame);
  }

  const parsedGameMove = GameMoveSchema.safeParse(req.body);
  if (!parsedGameMove.success) return response(res, "incorrectParams");
  const gameMove = parsedGameMove.data;

  if (gameMove.gameStatus === "started") {
    const message = await processStartedGame(gameMove, gameId, splits);
    if (typeof message === "string") return res.status(400).json({ message });
    await addGuessToDatabase(gameMove, gameId);
    return res.status(200).json(gameMove);
  } else if (gameMove.gameStatus === "finished") {
    return res.status(400).json({ message: "Game is already finished." });
  }
}
