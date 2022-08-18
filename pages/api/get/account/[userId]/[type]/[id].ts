import { Session } from "@prisma/client";
import { isArray } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../../lib/prisma";
import {
  Account,
  AccountType,
  GameDataSchema,
  GameMove,
} from "../../../../../../schemas";
import {
  response,
  authenticate,
  getAccount,
  pullPrompt,
  sessionToGameStack,
} from "../../../../helpers";
import { ErrorMessage } from "../../../../post/multiwordle";

export type Response = GameMove[] | ErrorMessage;

const types = ["id", "wallet", "gmail"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "GET") return response(res, "onlyGet");
  if (!authenticate(req)) return response(res, "authError");

  const { userId, type, id } = req.query;

  if (!id || !type || !userId) {
    return response(res, "incorrectParams");
  }

  if (isArray(userId) || isArray(id) || isArray(type)) {
    return response(res, "incorrectParams");
  }

  if (!types.includes(type)) return response(res, "incorrectParams");

  let typeAlreadyUsed = true;

  let account = await getAccount(id, type as "wallet" | "gmail");
  if (!account) {
    typeAlreadyUsed = false;
    account = await getAccount(userId);
  }

  if (!account) return response(res, "incorrectParams");

  const parsedPromptData = GameDataSchema.safeParse(pullPrompt());
  if (!parsedPromptData.success) return response(res, "internalError");
  const gameData = parsedPromptData.data;

  if (
    (type === "gmail" && account.email) ||
    (type === "wallet" && account.address)
  ) {
    const pred = (session: Session) => session.gameId === gameData.gameId;
    const session = account.sessions.find(pred);

    // if the user actually has a session with the current game
    if (!session) return response(res, "internalError");

    const moves = await sessionToGameStack(session.id, account, gameData);
    return res.status(200).json(moves);
  } else {
    const data: Account = { id: userId };
    if (type === "gmail") data.email = id;
    if (type === "wallet") data.address = id;

    if (typeAlreadyUsed) return;
    const result = await prisma.account.update({ where: { id: userId }, data });
    if (!result) return response(res, "internalError");

    return res.status(200).json({ message: "Successfully associated." });
  }
}
