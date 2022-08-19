import { z } from "zod";

// zod allows us to safely deal with API responses, ensuring that the data we get is what we expect

export const CharacterStatusSchema = z.union([
  z.literal("green"),
  z.literal("yellow"),
  z.literal("gray"),
  z.literal("empty"),
]);

export const GameStatusSchema = z.union([
  z.literal("new"),
  z.literal("started"),
  z.literal("finished"),
]);

export const StatsSchema = z.object({
  totalChars: z.number(),
  greens: z.number(),
  yellows: z.number(),
  grays: z.number(),
  totalWords: z.number(),
  hitWords: z.number(),
});

export const CharacterSchema = z.object({
  character: z.string(),
  status: CharacterStatusSchema,
});

export const WordSchema = z.object({
  completed: z.boolean(),
  characters: z.array(CharacterSchema),
});

export const AccountTypeSchema = z.union([
  z.literal("wallet"),
  z.literal("gmail"),
]);

export const AccountSchema = z.object({
  id: z.string(),
  type: z.enum(["COOKIE", "WALLET", "EMAIL"]),
  address: z.string(),
});

export const GameMoveSchema = z.object({
  text: z.string(),
  attempt: z.number(),
  gameId: z.number(),
  summary: z.array(z.number()),
  inputs: z.array(WordSchema),
  imagePath: z.string(),
  gameStatus: GameStatusSchema,
  stats: z.union([StatsSchema, z.undefined()]),
  globalPosition: z.union([z.number(), z.undefined()]),
  nextGameDate: z.string(),
  account: AccountSchema,
});

export const GameMovesSchema = z.array(GameMoveSchema);

export const GameStartSchema = z.object({
  gameStatus: z.literal("new"),
  type: z.string(),
  address: z.union([z.string(), z.undefined()]),
});

export const GameDataSchema = z.object({
  prompt: z.string(),
  imagePath: z.string(),
  gameId: z.number(),
  nextGameDate: z.string(),
});

export const GmailCredentialSchema = z.object({
  email: z.string(),
  email_verified: z.boolean(),
  family_name: z.string(),
  given_name: z.string(),
  locale: z.string(),
  name: z.string(),
  picture: z.string(),
  sub: z.string(),
});

export type CharacterStatus = z.infer<typeof CharacterStatusSchema>;
export type GameStatus = z.infer<typeof GameStatusSchema>;
export type Stats = z.infer<typeof StatsSchema>;

export type GameStart = z.infer<typeof GameStartSchema>;
export type GameMove = z.infer<typeof GameMoveSchema>;
export type GameMoves = z.infer<typeof GameMovesSchema>;
export type Word = z.infer<typeof WordSchema>;
export type Character = z.infer<typeof CharacterSchema>;

export type AccountType = z.infer<typeof AccountTypeSchema>;
export type Account = z.infer<typeof AccountSchema>;

export type GameData = z.infer<typeof GameDataSchema>;

export type GmailCredential = z.infer<typeof GmailCredentialSchema>;
