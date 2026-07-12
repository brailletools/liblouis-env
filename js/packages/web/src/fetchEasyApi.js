import fs from 'node:fs';
import path from 'node:path';

import { cacheDir } from './cacheDir.js';
import { EASY_API_RAW_URL, EASY_API_REF } from './easyApiVersion.js';

/**
 * Download and cache the pinned easy-api.js from liblouis/liblouis-js.
 * Returns the path to the cached file on disk.
 */
export async function fetchEasyApi() {
    const dir = cacheDir(`easy-api-${EASY_API_REF}`);
    const dest = path.join(dir, 'easy-api.js');
    if (fs.existsSync(dest)) return dest;

    const res = await fetch(EASY_API_RAW_URL);
    if (!res.ok) {
        throw new Error(`Failed to download ${EASY_API_RAW_URL}: HTTP ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return dest;
}
