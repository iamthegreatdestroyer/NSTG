/**
 * Set operations utilities
 */

export function union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA, ...setB]);
}

export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter(x => setB.has(x)));
}

export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter(x => !setB.has(x)));
}

export function symmetricDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const diff1 = difference(setA, setB);
  const diff2 = difference(setB, setA);
  return union(diff1, diff2);
}

export function isSubset<T>(setA: Set<T>, setB: Set<T>): boolean {
  return [...setA].every(x => setB.has(x));
}

export function isSuperset<T>(setA: Set<T>, setB: Set<T>): boolean {
  return isSubset(setB, setA);
}

export function equals<T>(setA: Set<T>, setB: Set<T>): boolean {
  return setA.size === setB.size && isSubset(setA, setB);
}
