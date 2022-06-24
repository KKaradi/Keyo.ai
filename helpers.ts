export const getImageSetIndex = () => {
  const { START_DATE } = process.env;
  if (!START_DATE) throw new Error("START_DATE not initialized");

  const sinceStart = Date.now() - new Date(START_DATE).getTime();
  return Math.floor(sinceStart / (1000 * 60 * 60 * 24)) + 1;
};
