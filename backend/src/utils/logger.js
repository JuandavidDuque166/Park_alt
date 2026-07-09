const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  if (typeof message === 'object') {
    message = JSON.stringify(message, Object.keys(message).sort(), 2);
  }
  return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
};

const logError = (message) => {
  const payload = formatMessage('error', message);
  fs.appendFileSync(errorLogPath, payload);
};

const logInfo = (message) => {
  const payload = formatMessage('info', message);
  fs.appendFileSync(accessLogPath, payload);
};

module.exports = {
  logError,
  logInfo
};
