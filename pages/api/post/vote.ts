// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type Response = { message: string };

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method != "POST")
    return res.status(405).send({ message: "Only POST requests allowed" });

  const { index, walletAddress } = req.body;

  if (index == undefined)
    res.status(400).json({ message: "Incorrect parameters: supply index." });

  await prisma.vote.create({ data: { index, walletAddress } });
  res.status(200).json({ message: "Successfully added to DB" });
}
