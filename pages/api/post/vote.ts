// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

type Response = { message: string };

const getYesterday = () => {
  const now = new Date(Date.now());
  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1
  );
};

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method != "POST") {
    const message = `Incorrect HTTP method ${req.method}: only use POST.`;
    return res.status(405).json({ message });
  }

  const { index, walletAddress } = req.body as {
    index: number;
    walletAddress: string;
  };

  if (index === undefined || walletAddress === undefined) {
    const message = "Incorrect parameters: supply index and wallet address.";
    return res.status(400).json({ message });
  }

  const hasVotedToday =
    (await prisma.vote.findFirst({
      where: {
        walletAddress: { equals: walletAddress },
        createdAt: { gt: getYesterday() },
      },
    })) != null;

  if (hasVotedToday) {
    return res.status(200).json({ message: "User already voted." });
  }

  const result = await prisma.vote
    .create({ data: { index, walletAddress } })
    .catch(console.error);

  if (!result) {
    return res.status(500).json({ message: "Database Insertion Error." });
  }

  res.status(200).json({ message: "Successfully added to DB." });
}
