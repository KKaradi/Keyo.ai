// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type Response = { message: string };

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method != "POST") {
    const message = "Only POST requests allowed";
    return res.status(405).json({ message });
  }

  const { index, walletAddress } = req.body;

  if (index === undefined || walletAddress === undefined) {
    const message = "Incorrect parameters: supply index and wallet address.";
    return res.status(400).json({ message });
  }

  await prisma.vote.create({ data: { index, walletAddress } });
  res.status(200).json({ message: "Successfully added to DB" });
}
