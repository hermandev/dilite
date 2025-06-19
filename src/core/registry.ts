import type { Class, Registration } from "./types";

export const globalRegistry = new Map<Class, Registration>();
export const tokenRegistry = new Map<string, Class>();
