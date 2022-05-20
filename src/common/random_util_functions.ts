// I try to use the name "functions" for pure functions only. This is technically
// not a pure function - it depends on an external random number generator which
// has a seed, and generating a random number will often affect the generator's
// internal state. However, it's actually quite practical for me to consider this
// a pure function of sorts, as any external change shouldn't have any bearing on
// my code, and it allows me to use this code in actual "pure" functions without
// tainting them.
export const getRandomInteger = (from: number, to: number): number => {
  return from + Math.floor(Math.random() * (to - from));
};
