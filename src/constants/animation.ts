export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const FADE_IN = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.5, ease: EASE } } as const;

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const waitFrames = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
export const EASE_DEAL: [number, number, number, number] = [0.0, 0.6, 0.3, 1.0];
export const EASE_FLY: [number, number, number, number] = [0.0, 0.55, 0.3, 1.0];
export const EASE_MOVE: [number, number, number, number] = [0.4, 0, 0.2, 1];
export const EASE_FLIP: [number, number, number, number] = [0.4, 0, 0.15, 1];
