// di/container.ts

import { AppError } from "../errors/app-error";
import { globalRegistry, tokenRegistry } from "./registry";
import { Class, InstanceMeta, LazyClass } from "./types";

/** Dependency Injection Container */
export class DIContainer {
  private singletons = new Map<Class, InstanceMeta>();
  private requestScope = new Map<Class, InstanceMeta>();

  constructor(
    private registry = globalRegistry,
    private tokenMap = tokenRegistry,
  ) {}

  /** Resolve class, handles singleton/request scope */
  async resolve<T>(cls: Class<T>): Promise<T> {
    const registration = this.registry.get(cls);
    if (!registration)
      throw new Error(`${cls.name} is not registered as @Injectable`);

    const { deps, scope } = registration;
    const map = scope === "singleton" ? this.singletons : this.requestScope;

    if (map.has(cls)) {
      return map.get(cls)!.instance;
    }

    const resolvedDeps = await Promise.all(
      deps.map(async (dep) => {
        const depClass = this.isClass(dep) ? dep : (dep as LazyClass)();
        return this.resolve(depClass);
      }),
    );

    const instance = new cls(...resolvedDeps);

    if (typeof (instance as any).onInit === "function") {
      await (instance as any).onInit();
    }

    map.set(cls, {
      instance,
      onDestroy:
        typeof (instance as any).onDestroy === "function"
          ? () => (instance as any).onDestroy()
          : undefined,
    });

    return instance;
  }

  /** Resolve via string token */
  async getInjection<T>(token: string): Promise<T> {
    const cls = this.tokenMap.get(token);
    if (!cls) throw new Error(`No class registered with token '${token}'`);
    return this.resolve(cls);
  }

  /** Reset request-scope objects (called after request ends) */
  async endRequestScope() {
    for (const { onDestroy } of this.requestScope.values()) {
      if (onDestroy) await onDestroy();
    }
    this.requestScope.clear();
  }

  /** Shutdown global app (e.g. on server close) */
  async shutdown() {
    for (const { onDestroy } of this.singletons.values()) {
      if (onDestroy) await onDestroy();
    }
    this.singletons.clear();
  }

  isClass(input: any): input is Class {
    return typeof input === "function" && "prototype" in input;
  }
}

export const container = new DIContainer();
export const getInjection = <T = any>(token: string): Promise<T> =>
  container.getInjection<T>(token);

/** Helper for safe server action execution with error handling */
export async function withContainer<T>(
  fn: (c: DIContainer) => Promise<T>,
): Promise<{
  data?: T;
  error?: { message: string; code: string; status: number };
}> {
  const c = new DIContainer();
  try {
    const data = await fn(c);
    return { data };
  } catch (err) {
    if (err instanceof AppError) {
      return {
        error: { message: err.message, code: err.code, status: err.status },
      };
    }
    return {
      error: { message: "Internal Server Error", code: "UNKNOWN", status: 500 },
    };
  } finally {
    await c.endRequestScope();
  }
}
