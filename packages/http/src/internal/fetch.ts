export type FetchLike = typeof fetch;

export async function fetchWithTimeout(
  fetchImplementation: FetchLike,
  input: string | URL,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);
  const mergedSignal = mergeAbortSignals(init.signal, timeoutController.signal);

  try {
    const requestInit = mergedSignal.signal === undefined
      ? init
      : {
          ...init,
          signal: mergedSignal.signal
        };

    return await fetchImplementation(input, requestInit);
  }
  finally {
    clearTimeout(timeoutId);
    mergedSignal.cleanup();
  }
}

function mergeAbortSignals(
  first: AbortSignal | null | undefined,
  second: AbortSignal | null | undefined
): { signal: AbortSignal | undefined; cleanup: () => void } {
  const signals = [first, second].filter((signal): signal is AbortSignal => signal !== null && signal !== undefined);

  if (signals.length === 0) {
    return { signal: undefined, cleanup: () => undefined };
  }

  if (signals.length === 1) {
    return { signal: signals[0], cleanup: () => undefined };
  }

  const controller = new AbortController();
  const listeners = new Map<AbortSignal, () => void>();

  const abort = () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  for (const signal of signals) {
    if (signal.aborted) {
      abort();
      break;
    }

    const listener = () => abort();
    listeners.set(signal, listener);
    signal.addEventListener("abort", listener, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      for (const [signal, listener] of listeners) {
        signal.removeEventListener("abort", listener);
      }
    }
  };
}
