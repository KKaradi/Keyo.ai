import type { NextApiResponse, NextApiRequest } from "next/types";
import prisma from "../../lib/prisma";

export const getYesterday = () => {
  const now = new Date(Date.now());
  return new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1
  );
};

export const responses = {
  onlyGet: { message: "Incorrect HTTP method: only use GET.", code: 405 },
  onlyPost: { message: "Incorrect HTTP method: only use POST", code: 405 },
  authError: { message: "You are not authenticated.", code: 403 },
  incorrectParams: { message: "Incorrect parameters.", code: 400 },
  hasVotedToday: { message: "User already voted today.", code: 461 },
  reloadPage: { message: "Please reoad the page.", code: 462 },
  DBError: { message: "Database Insertion Error.", code: 500 },
  DBSuccess: { message: "Succesfully added to database.", code: 200 },
};

type responseCategory = keyof typeof responses;

export const response = (res: NextApiResponse, category: responseCategory) => {
  const { message, code } = responses[category];
  return res.status(code).json({ message });
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
