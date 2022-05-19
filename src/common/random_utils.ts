export const getRandomInteger = (from: number, to: number): number => {
  return from + Math.floor(Math.random() * (to - from));
};
