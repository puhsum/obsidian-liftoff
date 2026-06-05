import { describe, it, expect } from "vitest";
import { formatDuration, parseDuration } from "../../src/utils/duration";

describe("formatDuration", () => {
	it("formats zero seconds", () => {
		expect(formatDuration(0)).toBe("0:00");
	});

	it("formats seconds only", () => {
		expect(formatDuration(45)).toBe("0:45");
	});

	it("pads seconds with leading zero", () => {
		expect(formatDuration(61)).toBe("1:01");
	});

	it("formats five minutes", () => {
		expect(formatDuration(300)).toBe("5:00");
	});

	it("handles sessions over 59:59 by counting minutes past 59", () => {
		expect(formatDuration(4500)).toBe("75:00");
	});
});

describe("parseDuration", () => {
	it("parses mm:ss", () => {
		expect(parseDuration("5:00")).toBe(300);
	});

	it("parses with zero seconds", () => {
		expect(parseDuration("1:00")).toBe(60);
	});

	it("parses with non-zero seconds", () => {
		expect(parseDuration("1:30")).toBe(90);
	});

	it("parses values over 59 minutes", () => {
		expect(parseDuration("75:00")).toBe(4500);
	});

	it("returns 0 for invalid input", () => {
		expect(parseDuration("abc")).toBe(0);
		expect(parseDuration("")).toBe(0);
		expect(parseDuration("5")).toBe(0);
	});

	it("is the inverse of formatDuration for whole-second values", () => {
		const seconds = 317;
		expect(parseDuration(formatDuration(seconds))).toBe(seconds);
	});
});
