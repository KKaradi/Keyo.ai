import { Session } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  Account,
  AccountType,
  AccountTypeSchema,
  GameDataSchema,
  GameMove,
  GameMoveSchema,
} from "../../../../../../schemas";
import {
  response,
  authenticate,
  getAccount,
  pullPrompt,
  sessionToGameStack,
  createAccount,
} from "../../../../helpers";
import { ErrorMessage } from "../../../../post/multiwordle";
import { z } from "zod";

export type Response = GameMove[] | ErrorMessage | Account;

const RequestSchema = z.object({
  cookieId: z.string(),
  type: AccountTypeSchema,
  address: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "GET") return response(res, "onlyGet");
  if (!authenticate(req)) return response(res, "authError");

  const parsedRequest = RequestSchema.safeParse(req.query);
  if (!parsedRequest.success) return response(res, "incorrectParams");
  const { cookieId, type, address } = parsedRequest.data;

  const account = await getAccount(address, type as AccountType);

  if (!account) {
    // copy sessions into new account
    const account = await getAccount(cookieId, "COOKIE");
    if (!account) return response(res, "incorrectParams");

    const { id } = await createAccount(address, account?.sessions, type);
    return res.status(200).json({ id, type, address });
  } else {
    // otherwise return the account's session
    const parsedPromptData = GameDataSchema.safeParse(pullPrompt());
    if (!parsedPromptData.success) return response(res, "internalError");
    const gameData = parsedPromptData.data;

    const pred = (session: Session) => session.gameId === gameData.gameId;
    const session = account.sessions.find(pred);

    // if the user actually has a session with the current game
    if (!session) return response(res, "internalError");

    const moves = await sessionToGameStack(session.id, account, gameData);
    return res.status(200).json(moves);
  }
}
