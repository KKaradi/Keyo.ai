import { useRef } from "react";
import Prisma from "@prisma/client";
import SETTINGS from "./settings.json";

export const getDay = () => {
  const START_DATE = SETTINGS.start_date ?? new Date(Date.now());

  const sinceStart = Date.now() - new Date(START_DATE).getTime();
  return Math.floor(sinceStart / (1000 * 60 * 60 * 24)) + 1;
};

export const get = async (url: string) => {
  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      AUTH_KEY: process.env.AUTH_KEY,
    } as HeadersInit,
  });
};

export const post = async <T>(url: string, body?: T) => {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      AUTH_KEY: process.env.AUTH_KEY,
    } as HeadersInit,
    body: JSON.stringify(body),
  });
};

export const useScroll = () => {
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const executeScroll = () =>
    scrollRef?.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  return [executeScroll, scrollRef] as const;
};

export type Vote = Omit<Prisma.Vote, "id" | "createdAt"> & {
  id?: string;
  createdAt?: Date;
};

export const clipboard = async (text: string) => {
  await navigator?.clipboard?.writeText(text);
};

export type Flatten<T extends readonly unknown[]> = T extends [
  infer F,
  ...infer R
]
  ? F extends readonly unknown[]
    ? [...Flatten<F>, ...Flatten<R>]
    : [F, ...Flatten<R>]
  : [];
