export const secondsToFormattedString = (time: number): string =>
  `${Math.floor(time / 60)}:${time % 60 < 10 ? `0${time % 60}` : time % 60}`;
