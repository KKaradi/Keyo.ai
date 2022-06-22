// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Response = {};

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method != "POST")
    return res.status(405).send({ message: "Only POST requests allowed" });

  const { index, walletAddress } = req.body;
  if (index != undefined) {
    await prisma.vote.create({ data: { index, walletAddress } });
  }

  res.status(200).json({});
}
