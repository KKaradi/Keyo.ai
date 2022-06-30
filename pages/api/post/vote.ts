import type { NextApiRequest, NextApiResponse } from "next";
import { getDayIndex } from "../../../helpers";
import prisma from "../../../lib/prisma";
import { authenticate, createWallet, getWallet, response } from "../helpers";

type ChoiceCount = { [key: number]: number };
type Body = {
  choiceIndex?: number;
  imageSetIndex?: number;
  dayIndex?: number;
  walletAddress?: string;
};

export type Response = { message: string; choiceCount: ChoiceCount };

const upsertWallet = async (address: string) => {
  const wallet = await getWallet(address);
  if (!wallet) return await createWallet(address);

  return prisma.wallet.update({
    data: { address, voteCount: wallet.voteCount + 1 },
    where: { address },
  });
};

const getChoiceCount = async (imageSetIndex: number, dayIndex: number) => {
  const groupedByChoice = await prisma.vote.groupBy({
    by: ["choiceIndex"],
    where: {
      imageSetIndex: { equals: imageSetIndex },
      dayIndex: { equals: dayIndex },
    },
    _count: { _all: true },
  });

  const choiceCount: ChoiceCount = {};

  groupedByChoice.forEach((choice) => {
    choiceCount[choice.choiceIndex] = choice._count._all;
  });

  return choiceCount;
};

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

  const voteData = { choiceIndex, walletAddress, dayIndex, imageSetIndex };

  let choiceCount: ChoiceCount;

  try {
    await upsertWallet(walletAddress);
    await prisma.vote.create({ data: voteData });
    choiceCount = await getChoiceCount(imageSetIndex, dayIndex);
  } catch (error) {
    return response(res, "DBError");
  }

  return res.status(200).json({ message: "DB Pull Success", choiceCount });
}
