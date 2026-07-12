import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LIBLOUIS_VERSION as JS_VERSION } from '../src/version.js';

test('Node LIBLOUIS_VERSION matches Python python/src/liblouis_env/version.py', () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pyPath = path.resolve(here, '../../../../python/src/liblouis_env/version.py');
    const contents = readFileSync(pyPath, 'utf8');
    const match = contents.match(/LIBLOUIS_VERSION\s*=\s*"([^"]+)"/);
    assert.ok(match, 'LIBLOUIS_VERSION not found in version.py');
    assert.equal(JS_VERSION, match[1]);
});
