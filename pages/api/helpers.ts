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

type RankingCount = { [key: string]: { chosen: number; denied: number } };

const getImages = async (
  count: RankingCount,
  category: "chosen" | "denied",
  day: number
) => {
  const images = await prisma.vote.groupBy({
    by: [category],
    where: { day: { equals: day } },
    _count: { _all: true },
  });

  images.forEach(({ chosen, denied, _count }) => {
    const imageId = category == "chosen" ? chosen : denied;
    if (!count[imageId]) count[imageId] = { chosen: 0, denied: 0 };
    count[imageId][category] = _count._all;
  });
};

export type Rankings = { [key: string]: number };

export const getRankings = async (imageId: string, day: number) => {
  const count: RankingCount = {};

  for (const category of ["chosen", "denied"] as const) {
    await getImages(count, category, day);
  }

  const imageScores = Object.entries(count)
    .map(([imageId, { chosen, denied }]) => {
      return { imageId, score: chosen / (denied + chosen) };
    })
    .sort((a, b) => b.score - a.score);

  const rankings: Rankings = {};

  let ranking = 1;
  imageScores.forEach(({ imageId, score }, index) => {
    if (index > 0 && score < imageScores[index - 1].score) ranking++;
    rankings[imageId] = ranking;
  });

  return rankings;
};
