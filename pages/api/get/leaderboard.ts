import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { authenticate, response } from "../helpers";

export type Response = {
  message: string;
  addresses: { walletAddress: string; votes: number; ens: string | null }[];
};

export default async function getLeaderboard(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "GET") return response(res, "onlyGet");

  const result = await prisma.wallet.findMany({
    take: 10,
    orderBy: { voteCount: "desc" },
    include: { votes: true },
  });

  const addresses = result.map(({ address, voteCount, ens }) => {
    return { walletAddress: address, votes: voteCount, ens };
  });

  if (!addresses) return response(res, "DBError");
  res.status(200).json({ message: "Successful DB Pull", addresses });
}
