// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Vote } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { authenticate, response } from "../../helpers";

type Response = { message: string; votes?: Vote[] };

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (!authenticate(req)) return response(res, "authError");
  if (req.method != "GET") return response(res, "onlyGet");

  const { walletAddress } = req.query as { walletAddress: string };
  if (!walletAddress) return response(res, "incorrectParams");

  const votes = await prisma.vote.findMany({
    where: { walletAddress: { equals: walletAddress } },
  });

  if (!votes) return response(res, "DBError");
  res.status(200).json({ message: "Successful DB Pull", votes });
}
