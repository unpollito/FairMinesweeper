import { secondsToFormattedString } from "./time_functions";

describe("secondsToFormattedString", () => {
  it("formats 0 seconds as 0:00", () => {
    expect(secondsToFormattedString(0)).toBe("0:00");
  });

  it("formats 1 second as 0:01", () => {
    expect(secondsToFormattedString(1)).toBe("0:01");
  });

  it("formats 9 seconds as 0:09", () => {
    expect(secondsToFormattedString(9)).toBe("0:09");
  });

  it("formats 10 seconds as 0:10", () => {
    expect(secondsToFormattedString(10)).toBe("0:10");
  });

  it("formats 59 seconds as 0:59", () => {
    expect(secondsToFormattedString(59)).toBe("0:59");
  });

  it("formats 60 seconds as 1:00", () => {
    expect(secondsToFormattedString(60)).toBe("1:00");
  });

  it("formats 61 seconds as 1:01", () => {
    expect(secondsToFormattedString(61)).toBe("1:01");
  });

  it("formats 599 seconds as 9:59", () => {
    expect(secondsToFormattedString(599)).toBe("9:59");
  });

  it("formats 600 seconds as 10:00", () => {
    expect(secondsToFormattedString(600)).toBe("10:00");
  });

  it("formats 601 seconds as 10:01", () => {
    expect(secondsToFormattedString(600)).toBe("10:00");
  });

  it("formats 3599 seconds as 59:59", () => {
    expect(secondsToFormattedString(3599)).toBe("59:59");
  });

  it("formats 3600 seconds as 60:00", () => {
    expect(secondsToFormattedString(3600)).toBe("60:00");
  });
});
