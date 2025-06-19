import { globalRegistry, tokenRegistry } from "../core/registry";
import type { Class, InjectableDep } from "../core/types";

/** Decorator to mark a class as injectable */
export function Injectable(options?: {
  deps?: InjectableDep[];
  scope?: "singleton" | "request";
  token?: string;
}) {
  const deps = options?.deps ?? [];
  const scope = options?.scope ?? "singleton";
  const token = options?.token;

  return function (target: Class) {
    globalRegistry.set(target, { deps, scope });
    if (token) tokenRegistry.set(token, target);
  };
}
