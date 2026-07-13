import { test } from 'node:test';
import assert from 'node:assert/strict';

import { patchEasyApi } from '../src/patchEasyApi.js';
import { FAKE_UNPATCHED_EASY_API, FAKE_PATCHED_EASY_API } from './fixtures/fakeEasyApi.js';

test('patchEasyApi fixes the output-buffer sizing and the failure-path leak', () => {
    assert.equal(patchEasyApi(FAKE_UNPATCHED_EASY_API), FAKE_PATCHED_EASY_API);
});

test('patchEasyApi normalizes CRLF input the same as LF input', () => {
    const crlf = FAKE_UNPATCHED_EASY_API.replace(/\n/g, '\r\n');
    assert.equal(patchEasyApi(crlf), FAKE_PATCHED_EASY_API);
});

test('patchEasyApi is idempotent-safe: throws rather than silently no-op patching already-patched or unrecognized content', () => {
    assert.throws(() => patchEasyApi(FAKE_PATCHED_EASY_API), /buggy translateString block not found/);
    assert.throws(() => patchEasyApi('// totally unrelated content'), /buggy translateString block not found/);
});
