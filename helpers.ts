export const getImageSetIndex = () => {
  const { START_DATE } = process.env;
  if (!START_DATE) throw new Error("START_DATE not initialized");

  const sinceStart = Date.now() - new Date(START_DATE).getTime();
  return Math.floor(sinceStart / (1000 * 60 * 60 * 24)) + 1;
};

type Body = { [key: string]: unknown };

export const get = async (url: string) => {
  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      AUTH_KEY: process.env.AUTH_KEY,
    } as HeadersInit,
  });
};

export const post = async (url: string, body?: Body) => {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      AUTH_KEY: process.env.AUTH_KEY,
    } as HeadersInit,
    body: JSON.stringify(body),
  });
};
