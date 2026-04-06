export function assertRecord(value: unknown, message: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(message);
  }

  return value as Record<string, unknown>;
}

export function assertNonEmptyString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(message);
  }

  return value;
}

export function assertFiniteNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new RangeError(message);
  }

  return value;
}

export function assertNumberInRange(
  value: unknown,
  minimum: number,
  maximum: number,
  message: string
): number {
  const numericValue = assertFiniteNumber(value, message);

  if (numericValue < minimum || numericValue > maximum) {
    throw new RangeError(message);
  }

  return numericValue;
}

export function assertNonNegativeNumber(value: unknown, message: string): number {
  const numericValue = assertFiniteNumber(value, message);

  if (numericValue < 0) {
    throw new RangeError(message);
  }

  return numericValue;
}

export function assertPositiveInteger(value: unknown, message: string): number {
  const numericValue = assertFiniteNumber(value, message);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new RangeError(message);
  }

  return numericValue;
}

export function assertOptionalNonNegativeNumber(value: unknown, message: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return assertNonNegativeNumber(value, message);
}

export function freezeValue<T>(value: T): Readonly<T> {
  return Object.freeze(value);
}
