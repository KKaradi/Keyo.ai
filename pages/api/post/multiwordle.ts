import type { NextApiRequest, NextApiResponse } from "next";
import schedule from "../../../schedule.json";
import {
  authenticate,
  createAccount,
  getAccount,
  pullTheme,
  response,
  sessionToGameStack,
} from "../helpers";
import {
  Character,
  GameThemeSchema,
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
  imageCID: string,
  promptSplits: string[],
  nextGameDate: string | undefined,
  addNewSession: boolean
): Promise<GameMove> {
  if (addNewSession) {
    await prisma.session.create({
      data: { completed: false, accountId: account.id, gameId },
    });
  }

  return {
    gameId,
    imageCID,
    text: "",
    gameStatus: "started",
    inputs: promptSplits.map(splitToEmptys),
    summary: promptSplits.map((split) => split.length),
    imagePath: imagePath,
    stats: undefined,
    nextGameDate,
    account,
    attempt: 0,
    inPostGame: false,
  };
}

export async function processStartedGame(
  gameMove: GameMove,
  gameId: number,
  promptSplits: string[],
  inPostGame: boolean
): Promise<string | true> {
  if (gameMove.gameId === undefined) return "Game ID is undefined";

  if (gameMove.gameId != gameId) {
    if (!schedule[gameMove.gameId]) return "Invalid Game ID";
    promptSplits = schedule[gameMove.gameId].prompt.split(" ");
  }

  gameMove.inPostGame = inPostGame;

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
  }

  gameMove.attempt += 1;
  return true;
}

export function processSingleWord(
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

export function handleWordle(
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
  const session = await prisma.session.findFirst({
    where: { gameId, accountId: account.id },
  });

  if (!session) return;

  if (gameStatus === "finished") {
    await prisma.session.update({
      where: { id: session.id },
      data: { completed: true, timeCompleted: new Date() },
    });
  }

  await prisma.guess.create({ data: { text, sessionId: session.id, attempt } });
};

export const RequestSchema = z.union([GameMoveSchema, GameStartSchema]);
export type Request = z.infer<typeof RequestSchema>;

export async function addGlobalRank(gameMove: GameMove) {
  if (gameMove.gameStatus !== "finished") return;

  const res = await prisma.session.findFirst({
    where: { gameId: gameMove.gameId, accountId: gameMove.account.id },
  });

  if (!res || !res.timeCompleted) return;
  gameMove.globalPosition =
    (await prisma.session.count({
      where: { timeCompleted: { lt: res.timeCompleted }, gameId: {equals: gameMove.gameId} },
    })) + 1;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") return response(res, "onlyPost");
  if (!authenticate(req)) return response(res, "authError");

  let parsedTheme = GameThemeSchema.safeParse(pullTheme());
  if (!parsedTheme.success) return response(res, "cantFindTheme");

  const {
    prompt,
    gameId: currentGameId,
    imagePath,
    imageCID,
    nextGameDate,
  } = parsedTheme.data;

  const splits = prompt.split(" ");

  const parsedGameStart = GameStartSchema.safeParse(req.body);
  if (parsedGameStart.success) {
    const { address } = parsedGameStart.data.account;
    let account = address ? await getAccount(address, "COOKIE") : undefined;
    if (account) {
      const pred = (session: Session) => session.gameId === currentGameId;
      const session = account.sessions.find(pred);
      if (session) {
        const theme = parsedTheme.data;
        const moves = await sessionToGameStack(session.id, account, theme);
        return res.status(200).json(moves);
      } else {
        const newGame = await generateNewGame(
          account,
          currentGameId,
          imagePath,
          imageCID,
          splits,
          nextGameDate,
          true
        );
        return res.status(200).json(newGame);
      }
    } else {
      const newGame = await generateNewGame(
        await createAccount(),
        currentGameId,
        imagePath,
        imageCID,
        splits,
        nextGameDate,
        true
      );
      return res.status(200).json(newGame);
    }
  }

  const parsedGameMove = GameMoveSchema.safeParse(req.body);
  if (!parsedGameMove.success) return response(res, "gameMoveTypeError");
  const gameMove = parsedGameMove.data;

  if (gameMove.gameStatus === "started") {
    parsedTheme = GameThemeSchema.safeParse(pullTheme(gameMove.gameId));

    if (!parsedTheme.success) return response(res, "cantFindTheme");

    const message = await processStartedGame(
      gameMove,
      parsedTheme.data.gameId,
      parsedTheme.data.prompt.split(" "),
      parsedTheme.data.gameId !== currentGameId
    );

    if (typeof message === "string") return res.status(400).json({ message });
    await addGuessToDatabase(gameMove, currentGameId);
    await addGlobalRank(gameMove);
    return res.status(200).json(gameMove);
  } else {
    return res.status(400).json({ message: "Game is already finished." });
  }
}
