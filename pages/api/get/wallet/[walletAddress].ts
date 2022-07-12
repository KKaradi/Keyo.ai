import { Vote, Wallet } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { authenticate, getWallet, createWallet, response } from "../../helpers";

export type Response = {
  message: string;
  votes: Vote[];
  percentileArray: number[];
};

const getPercentileArray = async () => {
  const byVotes = await prisma.wallet.groupBy({
    by: ["voteCount"],
    orderBy: { voteCount: "asc" },
  });

  return byVotes.map((elem) => elem.voteCount);
};

export default async function getWalletStats(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "GET") return response(res, "onlyGet");

  const { walletAddress } = req.query as { walletAddress: string };
  if (!walletAddress) return response(res, "incorrectParams");

  let wallet: (Wallet & { votes: Vote[] }) | null;
  let percentileArray: number[] = [];

  try {
    wallet = await getWallet(walletAddress);
    if (!wallet) await createWallet(walletAddress);

    percentileArray = await getPercentileArray();
  } catch (error) {
    console.error(error);
    return response(res, "DBError");
  }

  const responseData = {
    message: "Successful DB Pull",
    votes: wallet?.votes ?? [],
    percentileArray,
  };
  res.status(200).json(responseData);
}
