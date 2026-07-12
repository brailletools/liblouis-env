import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { zipSync } from 'fflate';

import { JS_BUILD_REF } from '../src/jsBuildVersion.js';
import { fetchJsBuildArchive } from '../src/fetchArchive.js';

test('fetchJsBuildArchive extracts, strips top-level dir, and caches on disk', async (t) => {
    const zipBuf = zipSync({
        [`js-build-${JS_BUILD_REF.slice(0, 7)}/build-no-tables-utf32.js`]: new TextEncoder().encode('// build'),
        [`js-build-${JS_BUILD_REF.slice(0, 7)}/tables/en-ueb-g2.ctb`]: new TextEncoder().encode('table'),
    });

    // Redirect the cache dir into a scratch tmp dir for this test only.
    const scratchHome = fs.mkdtempSync(path.join(os.tmpdir(), 'liblouis-env-web-home-'));
    const originalHome = process.env.HOME;
    const originalXdg = process.env.XDG_CACHE_HOME;
    process.env.HOME = scratchHome;
    process.env.XDG_CACHE_HOME = path.join(scratchHome, '.cache');

    const originalFetch = globalThis.fetch;
    let callCount = 0;
    globalThis.fetch = async (url) => {
        callCount += 1;
        assert.match(url, new RegExp(`liblouis/js-build/archive/${JS_BUILD_REF}\\.zip$`));
        return {
            ok: true,
            status: 200,
            arrayBuffer: async () => zipBuf.buffer.slice(zipBuf.byteOffset, zipBuf.byteOffset + zipBuf.byteLength),
        };
    };

    t.after(() => {
        globalThis.fetch = originalFetch;
        if (originalHome === undefined) delete process.env.HOME;
        else process.env.HOME = originalHome;
        if (originalXdg === undefined) delete process.env.XDG_CACHE_HOME;
        else process.env.XDG_CACHE_HOME = originalXdg;
        fs.rmSync(scratchHome, { recursive: true, force: true });
    });

    const dir1 = await fetchJsBuildArchive();
    assert.ok(fs.existsSync(path.join(dir1, 'build-no-tables-utf32.js')));
    assert.ok(fs.existsSync(path.join(dir1, 'tables', 'en-ueb-g2.ctb')));
    assert.equal(callCount, 1);

    const dir2 = await fetchJsBuildArchive();
    assert.equal(dir2, dir1);
    assert.equal(callCount, 1, 'second call should hit the on-disk cache, not the network');
});
