const sanitizeString = (value = '') => {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]+/g, '')
    .trim();
};

const sanitizeObject = (input = {}) => {
  if (typeof input !== 'object' || input === null) {
    return input;
  }
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, sanitizeString(value)])
  );
};

module.exports = { sanitizeString, sanitizeObject };
