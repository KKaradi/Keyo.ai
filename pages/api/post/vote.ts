// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getImageSetIndex } from "../../../helpers";
import prisma from "../../../lib/prisma";
import { authenticate, hasVotedToday, response } from "../helpers";

type ChoiceCount = { [key: number]: number };

type Response = { message: string; choiceCount: ChoiceCount };

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "POST") return response(res, "onlyPost");

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
    return response(res, "incorrectParams");
  }

  if (await hasVotedToday(walletAddress)) return response(res, "hasVotedToday");
  if (imageSetIndex != getImageSetIndex()) return response(res, "reloadPage");

  const voted = await prisma.vote
    .create({ data: { choiceIndex, walletAddress, imageSetIndex } })
    .catch(console.error);

  if (!voted) return response(res, "DBError");

  const groupedByChoice = await prisma.vote.groupBy({
    by: ["choiceIndex"],
    where: { imageSetIndex: { equals: imageSetIndex } },
    _count: { _all: true },
  });

  const choiceCount: ChoiceCount = {};

  groupedByChoice.forEach((choice) => {
    choiceCount[choice.choiceIndex] = choice._count._all;
  });

  return res.status(200).json({ message: "DB Pull Success", choiceCount });
}
