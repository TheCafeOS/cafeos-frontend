export function createSingleFlight(
  onFailure?: (error: unknown) => void,
): <T>(operation: () => Promise<T>) => Promise<T>;
