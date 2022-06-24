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

const messages: { [key: string]: Response } = {
  onlyPost: {
    message: `Incorrect HTTP method: only use POST.`,
  },
  incorrectParams: {
    message: "Incorrect parameters: supply index and wallet address.",
  },
  hasVotedToday: {
    message: "User already voted today.",
  },
  DBError: {
    message: "Database Insertion Error.",
  },
  success: {
    message: "Succesfully added to database.",
  },
};

const hasVotedToday = async (walletAddress: string) => {
  const result = await prisma.vote.findFirst({
    where: {
      walletAddress: { equals: walletAddress },
      createdAt: { gt: getYesterday() },
    },
  });

  return result != null;
};

export default async function storeVote(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method != "POST") {
    return res.status(405).json(messages.onlyPost);
  }

  const { index, walletAddress } = req.body as {
    index: number;
    walletAddress: string;
  };

  if (index === undefined || walletAddress === undefined) {
    return res.status(400).json(messages.incorrectParams);
  }

  if (await hasVotedToday(walletAddress)) {
    return res.status(401).json(messages.hasVotedToday);
  }

  const result = await prisma.vote
    .create({ data: { index, walletAddress } })
    .catch(console.error);

  if (!result) return res.status(500).json(messages.DBError);
  res.status(200).json(messages.success);
}
