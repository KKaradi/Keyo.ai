import { Session } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  Account,
  AccountType,
  AccountTypeSchema,
  GameThemeSchema,
  GameMove,
  GameMoveSchema,
} from "../../../../../../schemas";
import {
  response,
  authenticate,
  getAccount,
  pullTheme,
  sessionToGameStack,
  createAccount,
} from "../../../../helpers";
import { ErrorMessage, generateNewGame } from "../../../../post/multiwordle";
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
  if (!parsedRequest.success) return response(res, "cantFindTheme");
  const { cookieId, type, address } = parsedRequest.data;

  const account = await getAccount(address, type as AccountType);

  if (!account) {
    if (type === "COOKIE") {
      return response(res, "cantFindCookieAccount");
    } else {
      // copy sessions into new account

      const cookieAccount = await getAccount(cookieId, "COOKIE");
      if (!cookieAccount) return response(res, "cantFindCookieAccount");

      const { id } = await createAccount(
        address,
        cookieAccount?.sessions,
        type
      );
      return res.status(200).json({ id, type, address });
    }
  } else {
    // otherwise return the account's session
    const parsedTheme = GameThemeSchema.safeParse(pullTheme());
    if (!parsedTheme.success) return response(res, "cantFindTheme");
    const theme = parsedTheme.data;

    const pred = (session: Session) => session.gameId === theme.gameId;
    const session = account.sessions.find(pred);

    // if the user actually has a session with the current game
    if (!session) {
      const newGame = await generateNewGame(
        account,
        theme.gameId,
        theme.imagePath,
        theme.imageCID,
        theme.prompt.split(" "),
        theme.nextGameDate,
        true
      );
      return res.status(200).json([newGame]);
    }

    const moves = await sessionToGameStack(session.id, account, theme);
    return res.status(200).json(moves);
  }
}
