// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getImageSetIndex } from "../../../helpers";
import prisma from "../../../lib/prisma";
import { authenticate, messages, hasVotedToday } from "../helpers";

type Response = { message: string };

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) {
    return res.status(403).json(messages.authError);
  }

  if (req.method != "POST") {
    return res.status(405).json(messages.onlyPost);
  }

  const { choiceIndex, imageSetIndex, walletAddress } = req.body as {
    choiceIndex: number;
    imageSetIndex: number;
    walletAddress: string;
  };

  if (
    choiceIndex === undefined ||
    walletAddress === undefined ||
    imageSetIndex === undefined
  ) {
    return res.status(400).json(messages.incorrectParams);
  }

  if (await hasVotedToday(walletAddress)) {
    return res.status(461).json(messages.hasVotedToday);
  }

  if (imageSetIndex != getImageSetIndex()) {
    return res.status(462).json(messages.reloadPage);
  }

  const result = await prisma.vote
    .create({ data: { choiceIndex, walletAddress, imageSetIndex } })
    .catch(console.error);

  if (!result) return res.status(500).json(messages.DBError);
  res.status(200).json(messages.success);
}
