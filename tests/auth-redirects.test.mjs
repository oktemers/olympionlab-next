import test from 'node:test';
import assert from 'node:assert/strict';
import { safeAuthDestination } from '../app/auth/redirects.ts';

test('known internal destinations are preserved', () => {
  for (const value of ['/panel','/kurslar','/rota/adim/1','/student-labs','/courses/fizik-rehberlik']) {
    assert.equal(safeAuthDestination(value), value);
  }
});

test('malformed or external return URLs always fall back to panel', () => {
  for (const value of [
    null, undefined, '', 'https://evil.example', '//evil.example',
    '/\\\\evil.example', '/%2f%2fevil.example', '/panel?next=https://evil.example',
    '/panel#other', '/unknown-page', '/courses/a?continue=1', '/courses/UPPERCASE',
    '/courses/' + 'a'.repeat(120), '/panel\r\nHeader: bad'
  ]) {
    assert.equal(safeAuthDestination(value), '/panel', String(value));
  }
});
