import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePageOptions } from '../src/utils/pagination.js';
import { ApiError } from '../src/utils/errors.js';

test('pagination remains disabled for legacy requests', () => {
  assert.deepEqual(parsePageOptions({}), {
    enabled: false, page: 1, limit: null, skip: 0,
  });
});

test('pagination applies defaults and computes offsets', () => {
  assert.deepEqual(parsePageOptions({ page: '3' }), {
    enabled: true, page: 3, limit: 12, skip: 24,
  });
  assert.deepEqual(parsePageOptions({ page: '2', limit: '5' }), {
    enabled: true, page: 2, limit: 5, skip: 5,
  });
});

test('pagination rejects invalid page and limit values', () => {
  for (const query of [
    { page: '0' }, { page: '-1' }, { page: '1.5' }, { page: 'abc' },
    { limit: '0' }, { limit: '-2' }, { limit: '51' }, { limit: '2.5' },
  ]) {
    assert.throws(() => parsePageOptions(query), ApiError);
  }
});
