// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { colors } from "../../../constants/colors";
import { response, authenticate } from "../helpers";

const prisma = new PrismaClient();

type Response = {
  message?: string;
  content?: string;
  color?: string;
};

export default async function guessHandler(
  req: NextApiRequest,
  res: NextApiResponse<Response | Response[]>
) {
  if (req.method !== "POST") return response(res, "onlyPost");
  if (!authenticate(req)) return response(res, "authError");

  const { guess, wordIdx } = req.body as {
    guess: { content: string; color: string }[];
    wordIdx: number;
  };
  if (guess === undefined || wordIdx === undefined) {
    const message = "Incorrect parameters: supply guess and word index.";
    return res.status(400).json({ message });
  }

  const findPrompt = await prisma.prompt.findFirst();
  if (!findPrompt) return response(res, "DBError");

  const correctPrompt = findPrompt.prompt;
  const correctWord = correctPrompt.split(" ")[wordIdx];

  const result = guess.map(({ content }, index) => {
    const guessedLetter = content.toLowerCase();
    const letterPosition = correctWord.indexOf(guessedLetter);

    const box = { content: guess[index].content, color: colors.grey };
    if (letterPosition == -1) return box;

    if (guessedLetter == correctWord.charAt(index)) box.color = colors.green;
    else box.color = colors.yellow;

    return box;
  });

  res.status(200).json(result);
}
