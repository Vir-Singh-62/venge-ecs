export function clone<T>(input: T): T {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  return cloneObject(input, new Map());
}

function cloneObject<T extends object>(
  source: T,
  seen: Map<object, object>
): T {
  if (seen.has(source)) {
    return seen.get(source) as T;
  }

  // Date
  if (source instanceof Date) {
    return new Date(source.getTime()) as T;
  }

  // RegExp
  if (source instanceof RegExp) {
    return new RegExp(source.source, source.flags) as T;
  }

  // Map
  if (source instanceof Map) {
    const result = new Map();
    seen.set(source, result);
    for (const [k, v] of source) {
      result.set(clone(k), clone(v));
    }
    return result as T;
  }

  // Set
  if (source instanceof Set) {
    const result = new Set();
    seen.set(source, result);
    for (const v of source) {
      result.add(clone(v));
    }
    return result as T;
  }

  // Array
  if (Array.isArray(source)) {
    const result: unknown[] = [];
    seen.set(source, result);
    for (const v of source) {
      result.push(clone(v));
    }
    return result as T;
  }

  // Class instance or plain object
  const proto = Object.getPrototypeOf(source);
  const result = Object.create(proto) as T;
  seen.set(source, result);

  for (const key of Reflect.ownKeys(source)) {
    const desc = Object.getOwnPropertyDescriptor(source, key);
    if (!desc) continue;

    if ('value' in desc) {
      desc.value = clone(desc.value);
    }

    Object.defineProperty(result, key, desc);
  }

  return result;
}
