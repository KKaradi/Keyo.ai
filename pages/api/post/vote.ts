// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getDayIndex } from "../../../helpers";
import prisma from "../../../lib/prisma";
import { authenticate, response } from "../helpers";

type ChoiceCount = { [key: number]: number };
type Body = {
  choiceIndex?: number;
  imageSetIndex?: number;
  dayIndex?: number;
  walletAddress?: string;
};

type Response = { message: string; choiceCount: ChoiceCount };

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "POST") return response(res, "onlyPost");

  const { choiceIndex, imageSetIndex, dayIndex, walletAddress } =
    req.body as Body;

  if (
    choiceIndex === undefined ||
    walletAddress === undefined ||
    dayIndex === undefined ||
    imageSetIndex === undefined
  ) {
    return response(res, "incorrectParams");
  }

  if (dayIndex != getDayIndex()) return response(res, "reloadPage");

  const data = { choiceIndex, walletAddress, dayIndex, imageSetIndex };
  const voted = await prisma.vote.create({ data }).catch(console.error);
  if (!voted) return response(res, "DBError");

  const groupedByChoice = await prisma.vote.groupBy({
    by: ["choiceIndex"],
    where: { dayIndex: { equals: dayIndex } },
    _count: { _all: true },
  });

  const choiceCount: ChoiceCount = {};

  groupedByChoice.forEach((choice) => {
    choiceCount[choice.choiceIndex] = choice._count._all;
  });

  return res.status(200).json({ message: "DB Pull Success", choiceCount });
}
