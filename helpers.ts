import { useRef } from "react";
import Prisma from "@prisma/client";

export const getDay = () => {
  const { START_DATE } = process.env;
  if (!START_DATE) throw new Error("START_DATE not initialized");

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
  console.log(text);
  await navigator.clipboard.writeText(text);
};
