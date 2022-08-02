import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { authenticate, response } from "../../../helpers";
import { AccountType, Character, GameMove, Word } from "../../../../../schemas";

export type Response = { message: string } | GameMove[];

const upsertWallet = async (address: string) => {
  const where = { address } as const;
  const wallet = await prisma.wallet.findFirst({ where });
  if (!wallet) await prisma.wallet.create({ data: { address } });
};

const upsertGmail = async (email: string) => {
  const where = { email } as const;
  const gmail = await prisma.gmail.findFirst({ where });
  if (!gmail) await prisma.gmail.create({ data: { email } });
};

const getGameMoves = async (
  id: string,
  type: AccountType,
  game: number
): Promise<GameMove[]> => {
  let where: Prisma.GuessWhereInput = {};
  if (type === "wallet") where = { address: id, gameId: game };
  else if (type === "gmail") where = { email: id, gameId: game };
  else return [];

  const find = { where, orderBy: { time: "desc" } } as const;
  const guesses = await prisma.guess.findMany(find);

  return guesses.map((guess) => {
    const { prompt, colors, letters, gameId } = guess;
    const { imagePath, nextGameDate, gameStatus } = guess;

    const summary = prompt.split(" ").map((split) => split.length);

    const inputs: Word[] = prompt.split(" ").map((split) => {
      let completed = true;
      const characters: Character[] = split.split("").map(() => {
        const status = colors.shift() ?? "empty";
        const character = letters.shift() ?? "";
        if (status !== "green") completed = false;
        return { character, status };
      });

      return { completed, characters };
    });

    return { gameId, gameStatus, imagePath, summary, nextGameDate, inputs };
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "GET") return response(res, "onlyGet");

  const { id, gameId } = req.query as { id: string; gameId: string };
  if (!id || !gameId) return response(res, "incorrectParams");

  let gameMoves: GameMove[] = [];

  if (id.startsWith("0x")) {
    await upsertWallet(id);
    gameMoves = await getGameMoves(id, "wallet", Number(gameId));
  } else if (id.endsWith("@gmail.com")) {
    await upsertGmail(id);
    gameMoves = await getGameMoves(id, "gmail", Number(gameId));
  } else return response(res, "incorrectParams");

  res.status(200).json(gameMoves);
}
