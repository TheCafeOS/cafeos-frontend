export interface OrderSubmissionGuard {
  begin(fingerprint: string): string | null;
  complete(): void;
  fail(): void;
}

export function createOrderSubmissionGuard(
  generateKey?: () => string,
): OrderSubmissionGuard;
