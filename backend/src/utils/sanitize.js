const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;

  return String(value)
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const sanitizeObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      acc[key] = sanitizeObject(nestedValue);
      return acc;
    }, {});
  }

  if (typeof value === 'string') {
    return sanitizeText(value);
  }

  return value;
};

module.exports = { sanitizeText, sanitizeObject };
