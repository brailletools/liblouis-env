import fs from 'node:fs';
import path from 'node:path';

import { unzipSync } from 'fflate';

import { cacheDir } from './cacheDir.js';
import { JS_BUILD_ARCHIVE_URL, JS_BUILD_REF } from './jsBuildVersion.js';

const DONE_MARKER = '.complete';

/**
 * Download and extract the pinned liblouis/js-build archive, caching the result
 * on disk keyed by JS_BUILD_REF. Returns the path to the extracted directory
 * (with the archive's single top-level wrapper directory stripped).
 */
export async function fetchJsBuildArchive() {
    const extractDir = path.join(cacheDir(JS_BUILD_REF), 'js-build');
    const donePath = path.join(extractDir, DONE_MARKER);
    if (fs.existsSync(donePath)) return extractDir;

    const res = await fetch(JS_BUILD_ARCHIVE_URL);
    if (!res.ok) {
        throw new Error(`Failed to download ${JS_BUILD_ARCHIVE_URL}: HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const entries = unzipSync(buf);

    for (const [name, data] of Object.entries(entries)) {
        if (name.endsWith('/')) continue;
        // GitHub archive zips wrap contents in a single top-level dir
        // (e.g. js-build-0ae2413/...); strip it.
        const relative = name.split('/').slice(1).join('/');
        if (!relative) continue;
        const out = path.join(extractDir, relative);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, data);
    }
    fs.writeFileSync(donePath, '');

    return extractDir;
}
