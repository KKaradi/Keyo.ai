import prisma from "../../lib/prisma";
import schedule from "../../schedule.json";
import { Account, GameData, GameMove } from "../../schemas";
import type { NextApiResponse, NextApiRequest } from "next/types";
import { generateNewGame, processStartedGame } from "./post/multiwordle";

export const responses = {
  onlyGet: { message: "Incorrect HTTP method: only use GET.", code: 405 },
  onlyPost: { message: "Incorrect HTTP method: only use POST", code: 405 },
  authError: { message: "You are not authenticated.", code: 403 },
  incorrectParams: { message: "Incorrect parameters.", code: 400 },
  internalError: { message: "Internal Error", code: 500 },
  DBSuccess: { message: "Succesfully added to database.", code: 200 },
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

export const createAccount = async (): Promise<Account> => {
  const { id } = await prisma.account.create({ data: {} });
  return { id, address: undefined, email: undefined };
};

const getAccountById = async (id: string) =>
  await prisma.account.findUnique({
    where: { id },
    include: { sessions: true },
  });

const getAccountByGmail = async (email: string) =>
  await prisma.account.findUnique({
    where: { email },
    include: { sessions: true },
  });

const getAccountByAddress = async (id: string) =>
  await prisma.account.findUnique({
    where: { id },
    include: { sessions: true },
  });

export const getAccount = async (
  id: string,
  type: "id" | "wallet" | "gmail" = "id"
) => {
  let res = undefined;
  if (type === "id") res = await getAccountById(id);
  if (type === "gmail") res = await getAccountByGmail(id);
  if (type === "wallet") res = await getAccountByAddress(id);

  if (!res) return undefined;

  const address = res.address ?? undefined;
  const email = res.email ?? undefined;
  const sessions = res.sessions;

  return { id, address, email, sessions };
};

export function pullPrompt(): GameData | undefined {
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

    await processStartedGame(lastMoveClone, gameId, promptSplits);
    moves.push(lastMoveClone);
    lastMove = lastMoveClone;
  }

  return moves;
};
