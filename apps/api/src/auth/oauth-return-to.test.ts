import assert from 'node:assert/strict';
import test from 'node:test';
import { safePortalReturnTo } from './oauth-return-to.js';

test('safe return preserves a known subpath route and query', () => {
  assert.equal(
    safePortalReturnTo('/issue/issues/acme/project/42?tab=comments', 'https://portal.example.test/issue/'),
    '/issue/issues/acme/project/42?tab=comments',
  );
});

test('unsafe return falls back to the application subpath', () => {
  assert.equal(
    safePortalReturnTo('https://attacker.example.test/', 'https://portal.example.test/issue/'),
    '/issue/',
  );
});
