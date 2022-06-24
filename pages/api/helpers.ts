import type { NextApiRequest } from "next/types";
import prisma from "../../lib/prisma";

export const getYesterday = () => {
  const now = new Date(Date.now());
  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1
  );
};

export const messages: { [key: string]: { message: string } } = {
  onlyPost: {
    message: "Incorrect HTTP method: only use POST.",
  },
  onlyGet: {
    message: "Incorrect HTTP method: only use GET.",
  },
  authError: {
    message: "You are not authenticated.",
  },
  incorrectParams: {
    message: "Incorrect parameters.",
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

export const hasVotedToday = async (walletAddress: string) => {
  const result = await prisma.vote.findFirst({
    where: {
      walletAddress: { equals: walletAddress },
      createdAt: { gt: getYesterday() },
    },
  });

  return result != null;
};

export const authenticate = (req: NextApiRequest) => {
  const key = req.headers.auth_key;
  if (!key) return false;

  return process.env.AUTH_KEY == key;
};
