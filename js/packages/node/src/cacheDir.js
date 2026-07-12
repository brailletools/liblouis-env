import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

import { LIBLOUIS_VERSION } from './version.js';

function platformCacheBase() {
    if (process.platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Caches');
    }
    if (process.platform === 'win32') {
        return process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    }
    return process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
}

export function cacheDir() {
    const dir = path.join(platformCacheBase(), 'liblouis-env', LIBLOUIS_VERSION);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
