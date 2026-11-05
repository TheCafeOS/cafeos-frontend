export function createSingleFlight(onFailure = () => {}) {
  let pendingOperation = null;

  return function run(operation) {
    if (!pendingOperation) {
      pendingOperation = Promise.resolve()
        .then(operation)
        .catch((error) => {
          onFailure(error);
          throw error;
        })
        .finally(() => {
          pendingOperation = null;
        });
    }

    return pendingOperation;
  };
}
