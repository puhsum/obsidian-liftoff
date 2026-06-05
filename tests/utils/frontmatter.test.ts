import { describe, it, expect } from "vitest";
import { workoutToFrontmatter, workoutToMarkdownBody } from "../../src/utils/frontmatter";
import type { Workout } from "../../src/types";

const sampleWorkout: Workout = {
	type: "workout",
	template: "Push Day",
	date: "2026-03-21",
	start: "14:30",
	end: "15:45",
	duration: 75,
	exercises: [
		{
			name: "Bench Press",
			sets: [
				{ weight: 80, reps: 10, unit: "kg", completed: true },
				{ weight: 90, reps: 8, unit: "kg", completed: true },
			],
		},
	],
};

describe("workoutToFrontmatter", () => {
	it("serializes workout to YAML frontmatter string", () => {
		const result = workoutToFrontmatter(sampleWorkout);
		expect(result).toContain("type: workout");
		expect(result).toContain("template: Push Day");
		expect(result).toContain('date: "2026-03-21"');
		expect(result).toContain("name: Bench Press");
		expect(result).toContain("weight: 80");
		expect(result).toContain("reps: 10");
		expect(result).toContain("unit: kg");
		expect(result.startsWith("---\n")).toBe(true);
		expect(result.endsWith("\n---")).toBe(true);
	});
});

describe("workoutToMarkdownBody", () => {
	it("generates readable markdown tables", () => {
		const result = workoutToMarkdownBody(sampleWorkout);
		expect(result).toContain("# Push Day");
		expect(result).toContain("## Bench Press");
		expect(result).toContain("| 1   | 80 kg  | 10   |");
		expect(result).toContain("| 2   | 90 kg  | 8    |");
		expect(result).toContain("| Set | Weight | Reps |");
	});

	it("uses Workout as title for freeform workouts", () => {
		const freeform = { ...sampleWorkout, template: null };
		const result = workoutToMarkdownBody(freeform);
		expect(result).toContain("# Workout");
	});
});

const timerWorkout: Workout = {
	type: "workout",
	template: "HIIT",
	date: "2026-03-21",
	start: "07:00",
	end: "07:30",
	duration: 30,
	exercises: [
		{
			name: "Burpees",
			exerciseType: "timer",
			sets: [],
			workSeconds: 40,
			restSeconds: 20,
			intervals: 5,
		},
	],
};

describe("timer exercise frontmatter", () => {
	it("serializes timer exercise with exercise-level params", () => {
		const result = workoutToFrontmatter(timerWorkout);
		expect(result).toContain("exerciseType: timer");
		expect(result).toContain("workSeconds: 40");
		expect(result).toContain("restSeconds: 20");
		expect(result).toContain("intervals: 5");
		expect(result).not.toContain("weight:");
		expect(result).not.toContain("sets:");
	});
});

describe("timer exercise markdown body", () => {
	it("renders interval summary for timer exercises", () => {
		const result = workoutToMarkdownBody(timerWorkout);
		expect(result).toContain("## Burpees");
		expect(result).toContain("5");
		expect(result).toContain("0:40");
		expect(result).toContain("0:20");
		expect(result).not.toContain("Weight");
	});
});

const cardioWorkout: Workout = {
	type: "workout",
	template: "Cardio Day",
	date: "2026-03-21",
	start: "08:00",
	end: "08:45",
	duration: 45,
	exercises: [
		{
			name: "Run",
			exerciseType: "cardio",
			sets: [],
			duration: "5:00",
		},
	],
};

describe("cardio exercise frontmatter", () => {
	it("serializes cardio exercise with duration", () => {
		const result = workoutToFrontmatter(cardioWorkout);
		expect(result).toContain("exerciseType: cardio");
		expect(result).toContain("duration: 5:00");
		expect(result).not.toContain("weight:");
		expect(result).not.toContain("sets:");
		expect(result).not.toContain("workSeconds:");
	});

	it("omits duration field when not recorded", () => {
		const noTime: Workout = {
			...cardioWorkout,
			exercises: [{ name: "Run", exerciseType: "cardio", sets: [] }],
		};
		const result = workoutToFrontmatter(noTime);
		expect(result).toContain("exerciseType: cardio");
		// workout-level "duration: 45" is fine; exercise-level duration must be absent
		expect(result).not.toContain("    duration:");
	});
});

describe("cardio exercise markdown body", () => {
	it("renders duration for cardio exercises", () => {
		const result = workoutToMarkdownBody(cardioWorkout);
		expect(result).toContain("## Run");
		expect(result).toContain("Duration: 5:00");
		expect(result).not.toContain("Weight");
		expect(result).not.toContain("Intervals:");
	});

	it("renders em dash when no duration recorded", () => {
		const noTime: Workout = {
			...cardioWorkout,
			exercises: [{ name: "Run", exerciseType: "cardio", sets: [] }],
		};
		const result = workoutToMarkdownBody(noTime);
		expect(result).toContain("Duration: —");
	});
});
