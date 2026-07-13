import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { EASY_API_REF } from '../src/easyApiVersion.js';
import { fetchEasyApi } from '../src/fetchEasyApi.js';
import { FAKE_UNPATCHED_EASY_API, FAKE_PATCHED_EASY_API } from './fixtures/fakeEasyApi.js';

test('fetchEasyApi downloads, patches, and caches easy-api.js', async (t) => {
    const scratchHome = fs.mkdtempSync(path.join(os.tmpdir(), 'liblouis-env-web-home-'));
    const originalHome = process.env.HOME;
    const originalXdg = process.env.XDG_CACHE_HOME;
    process.env.HOME = scratchHome;
    process.env.XDG_CACHE_HOME = path.join(scratchHome, '.cache');

    const originalFetch = globalThis.fetch;
    let callCount = 0;
    globalThis.fetch = async (url) => {
        callCount += 1;
        assert.match(url, new RegExp(`liblouis-js/${EASY_API_REF}/easy-api\\.js$`));
        return {
            ok: true,
            status: 200,
            arrayBuffer: async () => new TextEncoder().encode(FAKE_UNPATCHED_EASY_API).buffer,
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

    const dest1 = await fetchEasyApi();
    assert.ok(fs.existsSync(dest1));
    assert.equal(fs.readFileSync(dest1, 'utf8'), FAKE_PATCHED_EASY_API);
    assert.equal(callCount, 1);

    const dest2 = await fetchEasyApi();
    assert.equal(dest2, dest1);
    assert.equal(callCount, 1, 'second call should hit the on-disk cache, not the network');
});
