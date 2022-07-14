import type { NextApiRequest, NextApiResponse } from "next";
import { getDay } from "../../../helpers";
import prisma from "../../../lib/prisma";
import provider from "../../../lib/provider";
import {
  authenticate,
  createWallet,
  getRankings,
  getWallet,
  Rankings,
  response,
} from "../helpers";

import { z } from "zod";

type ChoiceCount = { [image: string]: number };

const BodySchema = z.object({
  imageset: z.number(),
  day: z.number(),
  walletAddress: z.string(),
  chosen: z.string(),
  denied: z.string(),
  random: z.boolean(),
});

export type ExpectedBody = z.infer<typeof BodySchema>;

export type Response = {
  message: string;
  choiceCount: ChoiceCount;
  rankings: Rankings;
};

const upsertWallet = async (address: string) => {
  const ens = await provider.lookupAddress(address).catch(() => null);

  const wallet = await getWallet(address);
  if (!wallet) return await createWallet(address, ens ?? undefined);

  return prisma.wallet.update({
    data: { address, voteCount: wallet.voteCount + 1 },
    where: { address },
  });
};

const getChoiceCount = async (imageset: number, day: number) => {
  const groupedByChoice = await prisma.vote.groupBy({
    by: ["chosen"],
    where: {
      imageset: { equals: imageset },
      random: { equals: false },
      day: { equals: day },
    },
    _count: { _all: true },
  });

  const choiceCount: ChoiceCount = {};

  groupedByChoice.forEach((choice) => {
    choiceCount[choice.chosen] = choice._count._all;
  });

  return choiceCount;
};

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "POST") return response(res, "onlyPost");

  const body = BodySchema.safeParse(req.body);
  if (!body.success) return response(res, "incorrectParams");

  const { day, walletAddress, imageset, chosen, denied, random } = body.data;

  if (day != getDay()) return response(res, "reloadPage");

  const voteData = { walletAddress, day, imageset, chosen, denied, random };

  let choiceCount: ChoiceCount;
  let rankings: Rankings;

  try {
    await upsertWallet(walletAddress);
    await prisma.vote.create({ data: voteData });
    choiceCount = await getChoiceCount(imageset, day);
    rankings = await getRankings(chosen, day);
  } catch (error) {
    console.log(error);
    return response(res, "DBError");
  }

  return res
    .status(200)
    .json({ message: "DB Pull Success", choiceCount, rankings });
}
