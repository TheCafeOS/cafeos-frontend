export function createOrderSubmissionGuard(
  generateKey = () => globalThis.crypto.randomUUID(),
) {
  let submission = null;
  let isSubmitting = false;

  return {
    begin(fingerprint) {
      if (isSubmitting) {
        return null;
      }

      if (!submission || submission.fingerprint !== fingerprint) {
        submission = {
          fingerprint,
          key: generateKey(),
        };
      }

      isSubmitting = true;
      return submission.key;
    },
    complete() {
      submission = null;
      isSubmitting = false;
    },
    fail() {
      isSubmitting = false;
    },
  };
}
