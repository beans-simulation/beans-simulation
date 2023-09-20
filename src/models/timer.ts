const MILLISECONDS_LIMIT = 1000;
const SECONDS_LIMIT = 60;
const MINUTES_LIMIT = 60;

interface ITimer {
  total: number;
  hours: number;
  seconds: number;
  minutes: number;
  milliseconds: number;
  play: () => void;
  reset: () => void;
  restart: () => void;
  pause: () => void;
}

export class Timer implements ITimer {
  private time = 0;

  private interval?: NodeJS.Timeout;
  private interval_milliseconds = 10;

  constructor() {}

  private run(): void {
    this.time += this.interval_milliseconds;
  }

  public play(): void {
    this.interval = setInterval(this.run, this.interval_milliseconds);
  }

  // document.getElementById("hora").innerText = returnData(hora);
  // document.getElementById("minuto").innerText = returnData(minuto);
  // document.getElementById("segundo").innerText = returnData(segundo);
  // document.getElementById("milisegundo").innerText = returnData(milisegundo);

  public reset(): void {
    this.time = 0;
    clearInterval(this.interval);
  }

  public restart(): void {
    this.reset();
    this.play();
  }

  public pause(): void {
    clearInterval(this.interval);
  }

  private formatTime(time: number, min_length = 2): string {
    return String(time).padStart(min_length, "0");
  }

  get formatted_timer(): string {
    const hours = this.formatTime(this.hours);
    const minutes = this.formatTime(this.minutes);
    const seconds = this.formatTime(this.seconds);
    const milliseconds = this.formatTime(this.milliseconds, 3);

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  get hours(): number {
    return Math.floor(
      this.time / MINUTES_LIMIT / SECONDS_LIMIT / MILLISECONDS_LIMIT
    );
  }

  get minutes(): number {
    return Math.floor(
      (this.time / SECONDS_LIMIT / MILLISECONDS_LIMIT) % MINUTES_LIMIT
    );
  }

  get seconds(): number {
    return Math.floor(
      (this.time % (MINUTES_LIMIT * SECONDS_LIMIT)) / MILLISECONDS_LIMIT
    );
  }

  get milliseconds(): number {
    return this.time % MILLISECONDS_LIMIT;
  }

  get total(): number {
    return this.time;
  }

  get is_paused(): boolean {
    return !!this.interval;
  }
}
