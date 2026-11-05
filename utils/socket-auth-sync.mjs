export function createSocketAuthSynchronizer(socket, getAccessToken) {
  let synchronizedToken = getAccessToken();
  const provideLatestToken = (callback) => {
    callback({ token: getAccessToken() });
  };

  socket.auth = provideLatestToken;

  return function synchronizeSocketAuth(token) {
    if (token === synchronizedToken) {
      return false;
    }

    synchronizedToken = token;
    socket.auth = provideLatestToken;

    if (socket.connected || socket.active) {
      socket.disconnect();
      socket.connect();
    }

    return true;
  };
}
