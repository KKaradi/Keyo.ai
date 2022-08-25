import prisma from "../../lib/prisma";
import schedule from "../../schedule.json";
import { Account, GameData, GameMove } from "../../schemas";
import type { NextApiResponse, NextApiRequest } from "next/types";
import { generateNewGame, processStartedGame } from "./post/multiwordle";
import { AccountType, Session } from "@prisma/client";
import { addGlobalRank } from "./post/multiwordle";
export const responses = {
  onlyGet: { message: "Incorrect HTTP method: only use GET.", code: 405 },
  onlyPost: { message: "Incorrect HTTP method: only use POST", code: 405 },
  authError: { message: "You are not authenticated.", code: 403 },
  incorrectParams: { message: "Incorrect parameters.", code: 400 },
  internalError: { message: "Internal Error", code: 500 },
  DBSuccess: { message: "Succesfully added to database.", code: 200 },
  cantFindTheme: {
    message: "Today's game theme could not be found",
    code: 500,
  },
  gameMoveTypeError: {
    message: "The type of the provided game move is incorrect.",
    code: 400,
  },
  cantFindCookieAccount: {
    message: "Cookie account could not be found.",
    code: 404,
  },
};

type responseCategory = keyof typeof responses;

export const response = (res: NextApiResponse, category: responseCategory) => {
  const { message, code } = responses[category];
  return res.status(code).json({ message });
};

export const authenticate = (req: NextApiRequest) => {
  const key = req.headers.auth_key;
  if (!key) return false;

  return process.env.AUTH_KEY == key;
};

const copySessions = async (sessions: Session[], accountId: string) => {
  sessions.forEach(async ({ id, timeCompleted, completed, gameId }) => {
    const session = await prisma.session.findUnique({
      where: { id },
      include: { guesses: true },
    });

    if (!session) return;

    const { id: sessionId } = await prisma.session.create({
      data: { accountId, completed, gameId, timeCompleted },
    });

    session.guesses.forEach(async ({ attempt, text }) => {
      await prisma.guess.create({
        data: { attempt, text, sessionId },
      });
    });
  });
};

export async function createAccount(
  address?: string,
  sessions?: Session[],
  type: AccountType = "COOKIE"
): Promise<Account> {
  const result = await prisma.account.create({
    data: { type, address },
  });

  const { id, type: accType } = result;
  const data = { address: id };

  if (sessions) copySessions(sessions, id);
  if (!address) await prisma.account.update({ where: { id }, data });

  return { id, type: accType, address: address ?? id };
}

export async function getAccount(address: string, type: AccountType) {
  const result = await prisma.account.findFirst({
    where: { address, type },
    include: { sessions: true },
  });

  if (result === null) return undefined;

  return {
    id: result.id,
    type: result.type,
    address: result.address ?? undefined,
    sessions: result.sessions,
  };
}

export function pullTheme(
  gameId: number | undefined = undefined
): GameData | undefined {
  if (gameId === undefined) {
    const now = Date.now();
    for (let i = 0; i < schedule.length; i++) {
      const afterStart = new Date(schedule[i].start_date).getTime() <= now;
      const beforeEnd = now <= new Date(schedule[i].end_date).getTime();
      if (afterStart && beforeEnd) {
        return {
          prompt: schedule[i].prompt,
          imagePath: schedule[i].image_path,
          imageCID: schedule[i].image_CID,
          gameId: schedule[i].game_id,
          nextGameDate: schedule[i + 1]?.start_date,
        };
      }
    }
  } else {
    for (let i = 0; i < schedule.length; i++) {
      if (gameId === schedule[i].game_id) {
        return {
          prompt: schedule[i].prompt,
          imagePath: schedule[i].image_path,
          gameId: schedule[i].game_id,
          nextGameDate: schedule[i + 1]?.start_date,
        };
      }
    }
  }
}

export const sessionToGameStack = async (
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

  for (const { text } of guesses) {
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

    await processStartedGame(lastMoveClone, gameId, promptSplits, false);
    await addGlobalRank(lastMoveClone);
    moves.push(lastMoveClone);
    lastMove = lastMoveClone;
  }

  return moves;
};
