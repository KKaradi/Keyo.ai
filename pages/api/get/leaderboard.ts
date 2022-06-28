import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { authenticate, response } from "../helpers";

export type Response = {
  message: string;
  addresses: { walletAddress: string; votes: number }[];
};

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "GET") return response(res, "onlyGet");

  const result = await prisma.vote.groupBy({
    by: ["walletAddress"],
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
  });

  const addresses = result.map(({ walletAddress, _count }) => {
    return { walletAddress, votes: _count._all };
  });

  if (!addresses) return response(res, "DBError");
  res.status(200).json({ message: "Successful DB Pull", addresses });
}
