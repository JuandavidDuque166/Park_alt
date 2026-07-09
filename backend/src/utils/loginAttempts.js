const attempts = new Map();

const now = () => Date.now();

const isBlocked = (ip) => {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (entry.blockedUntil && entry.blockedUntil > now()) return true;
  if (entry.blockedUntil && entry.blockedUntil <= now()) {
    attempts.delete(ip);
  }
  return false;
};

const registerFailure = (ip) => {
  const entry = attempts.get(ip) || { count: 0, blockedUntil: null };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.blockedUntil = now() + 15 * 60 * 1000;
  }
  attempts.set(ip, entry);
};

const resetAttempts = (ip) => {
  attempts.delete(ip);
};

const getAttemptInfo = (ip) => attempts.get(ip) || { count: 0, blockedUntil: null };

module.exports = { isBlocked, registerFailure, resetAttempts, getAttemptInfo };
