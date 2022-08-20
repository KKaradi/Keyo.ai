import { IncomingMessage } from "http";
import { useRef } from "react";
import Parser from "ua-parser-js";
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

export const clipboard = async (text: string) => {
  await navigator?.clipboard?.writeText(text);
};

export const shuffle = <T>(array: T[]) => {
  let currIndex = array.length;
  let randIndex;

  while (currIndex != 0) {
    randIndex = Math.floor(Math.random() * currIndex);
    currIndex--;
    [array[currIndex], array[randIndex]] = [array[randIndex], array[currIndex]];
  }

  return array;
};

export function testIsMobile(req: IncomingMessage | undefined) {
  let userAgent;
  if (req) {
    userAgent = Parser(req.headers["user-agent"] || "");
  } else {
    userAgent = new Parser().getResult();
  }
  return userAgent?.device?.type === "mobile";
}
