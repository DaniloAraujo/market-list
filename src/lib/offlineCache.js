const SNAPSHOT_PREFIX = 'cloud:snapshot:';
const USER_KEY = 'auth:user';

export function readSnapshot(userId) {
  try {
    const raw = localStorage.getItem(`${SNAPSHOT_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSnapshot(userId, data) {
  try {
    localStorage.setItem(`${SNAPSHOT_PREFIX}${userId}`, JSON.stringify(data));
  } catch {
    return;
  }
}

export function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCachedUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    return;
  }
}

export function clearOfflineData() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(SNAPSHOT_PREFIX) || key === USER_KEY) localStorage.removeItem(key);
    }
  } catch {
    return;
  }
}
