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
  reloadPage: { message: "Outdated state. Please reload the page.", code: 461 },
  DBError: { message: "Database Insertion Error.", code: 500 },
  DBSuccess: { message: "Succesfully added to database.", code: 200 },
};

type responseCategory = keyof typeof responses;

export const response = (res: NextApiResponse, category: responseCategory) => {
  const { message, code } = responses[category];
  return res.status(code).json({ message });
};

export const authenticate = (req: NextApiRequest) => {
  const key = req.headers.auth_key;
  if (!key) return false;

  return process.env.AUTH_KEY == key;
};

export const getWallet = (address: string) => {
  return prisma.wallet.findUnique({
    where: { address },
    include: { votes: true },
  });
};

export const createWallet = (address: string, ens?: string) => {
  return prisma.wallet.create({ data: { address, ens } });
};
