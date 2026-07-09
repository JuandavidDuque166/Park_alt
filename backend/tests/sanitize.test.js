const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeText, sanitizeObject } = require('../src/utils/sanitize');

test('sanitizeText removes HTML tags and trims whitespace', () => {
  const result = sanitizeText('  <script>alert(1)</script> Juan  ');
  assert.equal(result, 'Juan');
});

test('sanitizeObject sanitizes nested string values', () => {
  const result = sanitizeObject({ nombre: '  <b>Juan</b>  ', perfil: { email: '  test@example.com  ' } });
  assert.equal(result.nombre, 'Juan');
  assert.equal(result.perfil.email, 'test@example.com');
});
