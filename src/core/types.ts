export type Class<T = any> = new (...args: any[]) => T;
export type LazyClass<T = any> = () => Class<T>;
export type InjectableDep = Class | LazyClass;

export interface Registration {
  deps: InjectableDep[];
  scope: "singleton" | "request";
}

export interface InstanceMeta {
  instance: any;
  onDestroy?: () => void | Promise<void>;
}
