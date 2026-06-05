import { formatDuration, parseDuration } from "../utils/duration";

export interface CardioBlockCallbacks {
	onChanged: (duration: string | undefined) => void;
}

type CardioPhase = "idle" | "running" | "stopped";

export class CardioBlock {
	private containerEl: HTMLElement;
	private elapsedSeconds: number = 0;
	private phase: CardioPhase = "idle";
	private intervalId: number | null = null;
	private displayEl: HTMLElement | null = null;

	constructor(
		parentEl: HTMLElement,
		existingDuration: string | undefined,
		private callbacks: CardioBlockCallbacks
	) {
		if (existingDuration) {
			this.elapsedSeconds = parseDuration(existingDuration);
			this.phase = "stopped";
		}
		this.containerEl = parentEl.createDiv({ cls: "ln-cardio-block" });
		this.render();
	}

	private render(): void {
		this.stopInterval();
		this.containerEl.empty();
		this.containerEl.removeClass("ln-cardio-idle", "ln-cardio-running", "ln-cardio-stopped");
		this.containerEl.addClass(`ln-cardio-${this.phase}`);
		this.displayEl = null;

		if (this.phase === "idle") {
			this.displayEl = this.containerEl.createDiv({
				cls: "ln-cardio-display",
				text: "0:00",
			});
			const startBtn = this.containerEl.createEl("button", {
				cls: "ln-cardio-btn ln-cardio-start-btn",
				text: "Start",
			});
			startBtn.addEventListener("click", () => this.start());
		} else if (this.phase === "running") {
			this.displayEl = this.containerEl.createDiv({
				cls: "ln-cardio-display ln-cardio-display-running",
				text: formatDuration(this.elapsedSeconds),
			});
			const stopBtn = this.containerEl.createEl("button", {
				cls: "ln-cardio-btn ln-cardio-stop-btn",
				text: "Stop",
			});
			stopBtn.addEventListener("click", () => this.stop());
			this.tick();
		} else {
			// stopped — editable input pre-filled with elapsed time
			const input = this.containerEl.createEl("input", {
				cls: "ln-cardio-input",
				attr: {
					type: "text",
					value: formatDuration(this.elapsedSeconds),
					placeholder: "mm:ss",
				},
			}) as HTMLInputElement;
			input.addEventListener("blur", () => {
				const parsed = parseDuration(input.value.trim());
				if (parsed > 0) {
					this.elapsedSeconds = parsed;
					input.value = formatDuration(parsed);
					this.callbacks.onChanged(formatDuration(parsed));
				} else {
					input.value = formatDuration(this.elapsedSeconds);
				}
			});
			const resetBtn = this.containerEl.createEl("button", {
				cls: "ln-cardio-btn ln-cardio-reset-btn",
				text: "Reset",
			});
			resetBtn.addEventListener("click", () => this.reset());
		}
	}

	private start(): void {
		this.elapsedSeconds = 0;
		this.phase = "running";
		this.render();
	}

	private tick(): void {
		this.intervalId = window.setInterval(() => {
			this.elapsedSeconds++;
			if (this.displayEl) {
				this.displayEl.textContent = formatDuration(this.elapsedSeconds);
			}
		}, 1000);
	}

	private stop(): void {
		this.stopInterval();
		this.phase = "stopped";
		this.render();
		this.callbacks.onChanged(formatDuration(this.elapsedSeconds));
	}

	private reset(): void {
		this.elapsedSeconds = 0;
		this.phase = "idle";
		this.render();
		this.callbacks.onChanged(undefined);
	}

	private stopInterval(): void {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	getDuration(): string | undefined {
		// idle = never started, treat as no result
		if (this.phase === "idle") return undefined;
		// running or stopped: return elapsed time (even if 0:00 from an instant stop)
		return formatDuration(this.elapsedSeconds);
	}

	destroy(): void {
		this.stopInterval();
		this.containerEl.remove();
	}
}
