# Dilite

**Dilite** adalah _dependency injection container_ yang ringan dan sederhana untuk aplikasi TypeScript dan Next.js.

## ✨ Fitur

- Ringan dan tanpa _dependency_ eksternal
- Dukungan decorator berbasis `@Injectable`
- Mudah digunakan dalam arsitektur modular
- Cocok untuk project berbasis TypeScript / Next.js

## 📦 Instalasi

```bash
npm install @hermandev/dilite
```

Example:

```typescript
import { Injectable, getInjection } from "@hermandev/dilite";

@Injectable({ token: "FooService" })
class FooService {
  sayHello() {
    return "Hello from Foo!";
  }
}

@Injectable({ token: "BarService", deps: [FooService] })
class BarService {
  constructor(private foo: FooService) {}

  greet() {
    return this.foo.sayHello();
  }
}

const bar = await getInjection("BarService");
console.log(bar.greet()); // "Hello from Foo!"
```
