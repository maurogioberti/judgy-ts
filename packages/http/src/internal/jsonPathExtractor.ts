type PathSegment =
  | { readonly kind: "property"; readonly name: string }
  | { readonly kind: "index"; readonly index: number };

export function extractJsonPath(json: string, jsonPath: string): string {
  if (typeof json !== "string" || json.trim().length === 0) {
    throw new TypeError("JSON content cannot be null or whitespace.");
  }

  if (typeof jsonPath !== "string" || jsonPath.trim().length === 0) {
    throw new TypeError("JSON path cannot be null or whitespace.");
  }

  const segments = parsePath(jsonPath);
  let current: unknown = JSON.parse(json);

  for (const segment of segments) {
    current = navigate(current, segment, jsonPath);
  }

  return typeof current === "string" ? current : JSON.stringify(current);
}

function parsePath(jsonPath: string): PathSegment[] {
  const path = jsonPath.startsWith("$") ? jsonPath.slice(1) : jsonPath;
  const segments: PathSegment[] = [];
  let index = 0;

  while (index < path.length) {
    if (path[index] === ".") {
      index += 1;
      const start = index;

      while (index < path.length && path[index] !== "." && path[index] !== "[") {
        index += 1;
      }

      if (index > start) {
        segments.push({ kind: "property", name: path.slice(start, index) });
      }
    }
    else if (path[index] === "[") {
      index += 1;
      const start = index;

      while (index < path.length && path[index] !== "]") {
        index += 1;
      }

      if (index >= path.length) {
        throw new Error(`Unterminated bracket in JSON path: '${jsonPath}'`);
      }

      const indexText = path.slice(start, index);
      const numericIndex = Number.parseInt(indexText, 10);

      if (!Number.isInteger(numericIndex)) {
        throw new Error(`Invalid array index '${indexText}' in JSON path: '${jsonPath}'`);
      }

      segments.push({ kind: "index", index: numericIndex });
      index += 1;
    }
    else {
      const start = index;

      while (index < path.length && path[index] !== "." && path[index] !== "[") {
        index += 1;
      }

      if (index > start) {
        segments.push({ kind: "property", name: path.slice(start, index) });
      }
    }
  }

  return segments;
}

function navigate(value: unknown, segment: PathSegment, fullPath: string): unknown {
  if (segment.kind === "property") {
    return navigateProperty(value, segment.name, fullPath);
  }

  return navigateArray(value, segment.index, fullPath);
}

function navigateProperty(value: unknown, propertyName: string, fullPath: string): unknown {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      `Expected JSON object for property '${propertyName}' in path: '${fullPath}'`
    );
  }

  if (!(propertyName in value)) {
    throw new Error(`Property '${propertyName}' not found in JSON path: '${fullPath}'`);
  }

  return (value as Record<string, unknown>)[propertyName];
}

function navigateArray(value: unknown, index: number, fullPath: string): unknown {
  if (!Array.isArray(value)) {
    throw new Error(`Expected JSON array for index [${index}] in path: '${fullPath}'`);
  }

  if (index < 0 || index >= value.length) {
    throw new Error(`Array index [${index}] out of range (length: ${value.length}) in path: '${fullPath}'`);
  }

  return value[index];
}
