import test from 'node:test';
import assert from 'node:assert/strict';
import { num, publicUser } from '../src/utils/core.js';
import { ApiError } from '../src/utils/errors.js';

test('num accepts valid non-negative numeric values', () => {
  assert.equal(num('12.5', 'Price'), 12.5);
  assert.equal(num(100, 'Progress', { max: 100 }), 100);
  assert.equal(num('4', 'Count', { int: true }), 4);
  assert.throws(() => num(4.5, 'Count', { int: true }), ApiError);
});

test('num rejects invalid, negative, and out-of-range values', () => {
  for (const value of [null, '', 'abc', 'Infinity', 'NaN', -1, '-2']) {
    assert.throws(() => num(value, 'Price'), ApiError);
  }
  assert.throws(() => num(101, 'Progress', { max: 100 }), ApiError);
});

test('publicUser removes password hashes without mutating the source', () => {
  const user = { id: 'user_1', name: 'Learner', passwordHash: 'secret' };
  const result = publicUser(user);
  assert.deepEqual(result, { id: 'user_1', name: 'Learner' });
  assert.equal(user.passwordHash, 'secret');
  assert.equal(publicUser(null), null);
});
