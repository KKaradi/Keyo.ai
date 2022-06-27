export const getImageSetIndex = () => {
  const { START_DATE } = process.env;
  if (!START_DATE) throw new Error("START_DATE not initialized");

  const sinceStart = Date.now() - new Date(START_DATE).getTime();
  return Math.floor(sinceStart / (1000 * 60 * 60 * 24)) + 1;
};

export const request = async (
  url: string,
  method: string,
  body: { [key: string]: unknown } | undefined
) => {
  return await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      AUTH_KEY: process.env.AUTH_KEY,
    } as HeadersInit,
    body: JSON.stringify(body),
  });
};
