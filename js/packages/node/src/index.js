import { execFileSync } from 'node:child_process';

import { ensureInstalled, LiblouisNotFoundError } from './fetch.js';
import { LIBLOUIS_VERSION } from './version.js';

export { LIBLOUIS_VERSION, ensureInstalled, LiblouisNotFoundError };

/**
 * Resolve a working lou_translate binary path, without installing anything.
 *
 * Resolution order:
 *   1. LOU_TRANSLATE_PATH env var, if set
 *   2. lou_translate already on PATH
 *
 * Returns null if neither is found — never fetches/installs, never touches the
 * network. Safe to call from inside a CLI tool that shouldn't surprise users with
 * network access or sudo prompts.
 */
export function resolveLouTranslate() {
    if (process.env.LOU_TRANSLATE_PATH) return process.env.LOU_TRANSLATE_PATH;
    try {
        const finder = process.platform === 'win32' ? 'where' : 'which';
        const found = execFileSync(finder, ['lou_translate'], { encoding: 'utf8' }).split('\n')[0].trim();
        return found || null;
    } catch {
        return null;
    }
}

/**
 * Return a usable path to the lou_translate binary, fetching/installing it if needed.
 * The Node.js analog of Python's get_lou_translate().
 */
export async function getLouTranslate() {
    return resolveLouTranslate() ?? (await ensureInstalled());
}
