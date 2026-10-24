import { describe, expect, it } from "vitest";
import { ethAdd, ethBps, ethMul, ethSub, formatEth, toWei, fromWei } from "./eth";

describe("eth decimal math", () => {
  it("adds without float drift", () => {
    expect(ethAdd("0.1", "0.2")).toBe("0.3");
  });
  it("multiplies by integer quantity", () => {
    expect(ethMul("1.19", 3)).toBe("3.57");
    expect(() => ethMul("1", 1.5)).toThrow();
  });
  it("applies basis points rounding down", () => {
    expect(ethBps("10", 1000)).toBe("1");
    expect(ethSub("3.57", ethBps("3.57", 1000))).toBe("3.213");
  });
  it("round-trips wei", () => {
    expect(fromWei(toWei("0.000000000000000001"))).toBe("0.000000000000000001");
  });
  it("formats truncated", () => {
    expect(formatEth("1.199")).toBe("1.19 ETH");
    expect(formatEth("2")).toBe("2.00 ETH");
  });
});
