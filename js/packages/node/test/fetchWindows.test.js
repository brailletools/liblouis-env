import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { zipSync } from 'fflate';

import { fetchWindows } from '../src/fetch.js';

test('fetchWindows downloads, extracts, and locates lou_translate.exe', async (t) => {
    const zipBuf = zipSync({
        'liblouis-3.38.0-win64/bin/lou_translate.exe': new TextEncoder().encode('fake binary'),
    });

    const originalArch = Object.getOwnPropertyDescriptor(process, 'arch');
    Object.defineProperty(process, 'arch', { value: 'x64', configurable: true });

    const originalFetch = globalThis.fetch;
    let callCount = 0;
    globalThis.fetch = async (url) => {
        callCount += 1;
        assert.match(url, /liblouis-3\.38\.0-win64\.zip$/);
        return {
            ok: true,
            status: 200,
            arrayBuffer: async () => zipBuf.buffer.slice(zipBuf.byteOffset, zipBuf.byteOffset + zipBuf.byteLength),
        };
    };

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'liblouis-env-win-'));

    t.after(() => {
        globalThis.fetch = originalFetch;
        if (originalArch) Object.defineProperty(process, 'arch', originalArch);
        fs.rmSync(dir, { recursive: true, force: true });
    });

    const binary = await fetchWindows(dir);
    assert.ok(fs.existsSync(binary));
    assert.equal(path.basename(binary), 'lou_translate.exe');
    assert.equal(fs.readFileSync(binary, 'utf8'), 'fake binary');
    assert.equal(callCount, 1);

    // Second call should hit the on-disk cache, not the network again.
    await fetchWindows(dir);
    assert.equal(callCount, 1);
});
