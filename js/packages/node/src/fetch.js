import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { unzipSync } from 'fflate';

import { cacheDir } from './cacheDir.js';
import { GITHUB_RELEASE_BASE, LIBLOUIS_VERSION } from './version.js';

export class LiblouisNotFoundError extends Error {}

async function download(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new LiblouisNotFoundError(`Download failed: ${url} (HTTP ${res.status})`);
    }
    return Buffer.from(await res.arrayBuffer());
}

function findBinary(root, name) {
    const stack = [root];
    while (stack.length) {
        const dir = stack.pop();
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                stack.push(full);
            } else if (entry.name === name) {
                return full;
            }
        }
    }
    return null;
}

function which(name) {
    try {
        const finder = process.platform === 'win32' ? 'where' : 'which';
        const found = execFileSync(finder, [name], { encoding: 'utf8' }).split('\n')[0].trim();
        return found || null;
    } catch {
        return null;
    }
}

export async function fetchWindows(dir) {
    const arch = process.arch === 'x64' ? 'win64' : 'win32';
    const zipPath = path.join(dir, `liblouis-${arch}.zip`);
    if (!fs.existsSync(zipPath)) {
        const buf = await download(`${GITHUB_RELEASE_BASE}/liblouis-${LIBLOUIS_VERSION}-${arch}.zip`);
        fs.writeFileSync(zipPath, buf);
    }
    const extractDir = path.join(dir, arch);
    if (!fs.existsSync(extractDir)) {
        const entries = unzipSync(fs.readFileSync(zipPath));
        for (const [name, data] of Object.entries(entries)) {
            if (name.endsWith('/')) continue;
            const out = path.join(extractDir, name);
            fs.mkdirSync(path.dirname(out), { recursive: true });
            fs.writeFileSync(out, data);
        }
    }
    const binary = findBinary(extractDir, 'lou_translate.exe');
    if (!binary) {
        throw new LiblouisNotFoundError(
            `lou_translate.exe not found inside ${zipPath} — release layout may have changed.`
        );
    }
    return binary;
}

export function fetchMacos() {
    if (!which('brew')) {
        throw new LiblouisNotFoundError(
            'Homebrew not found. Install it from https://brew.sh, then run ' +
            '`brew install liblouis`, or set LOU_TRANSLATE_PATH yourself.'
        );
    }
    execFileSync('brew', ['install', 'liblouis'], { stdio: 'inherit' });
    const prefix = execFileSync('brew', ['--prefix', 'liblouis'], { encoding: 'utf8' }).trim();
    const binary = path.join(prefix, 'bin', 'lou_translate');
    if (!fs.existsSync(binary)) {
        throw new LiblouisNotFoundError(`brew installed liblouis but ${binary} is missing.`);
    }
    return binary;
}

export function fetchLinux() {
    const found = which('lou_translate');
    if (found) return found;

    const installers = [
        ['apt-get', ['sudo', 'apt-get', 'install', '-y', 'liblouis-bin']],
        ['dnf', ['sudo', 'dnf', 'install', '-y', 'liblouis']],
    ];
    for (const [manager, installCmd] of installers) {
        if (which(manager)) {
            execFileSync(installCmd[0], installCmd.slice(1), { stdio: 'inherit' });
            const installed = which('lou_translate');
            if (installed) return installed;
        }
    }
    throw new LiblouisNotFoundError(
        'Could not find or install lou_translate via apt-get/dnf. Install liblouis ' +
        'manually for your distro, or set LOU_TRANSLATE_PATH.'
    );
}

export async function ensureInstalled() {
    const dir = cacheDir();
    if (process.platform === 'win32') return fetchWindows(dir);
    if (process.platform === 'darwin') return fetchMacos();
    if (process.platform === 'linux') return fetchLinux();
    throw new LiblouisNotFoundError(`Unsupported platform: ${process.platform}`);
}
