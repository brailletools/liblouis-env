import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { locateBuildVariant } from '../src/locateVariant.js';

function mkFixtureDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'liblouis-env-web-fixture-'));
}

test('prefers an embedded-tables build when present', () => {
    const dir = mkFixtureDir();
    try {
        fs.writeFileSync(path.join(dir, 'build-tables-embeded-root-utf16.js'), '');
        fs.writeFileSync(path.join(dir, 'build-no-tables-utf32.js'), '');
        fs.mkdirSync(path.join(dir, 'tables'));

        const variant = locateBuildVariant(dir);
        assert.equal(variant.kind, 'embedded');
        assert.equal(path.basename(variant.buildFile), 'build-tables-embeded-root-utf16.js');
        assert.equal(variant.needsTables, false);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

test('falls back to no-tables build + tables/ dir', () => {
    const dir = mkFixtureDir();
    try {
        fs.writeFileSync(path.join(dir, 'build-no-tables-utf32.js'), '');
        fs.mkdirSync(path.join(dir, 'tables'));
        fs.writeFileSync(path.join(dir, 'tables', 'en-ueb-g2.ctb'), '');

        const variant = locateBuildVariant(dir);
        assert.equal(variant.kind, 'no-tables');
        assert.equal(path.basename(variant.buildFile), 'build-no-tables-utf32.js');
        assert.equal(variant.needsTables, true);
        assert.equal(variant.tablesDir, path.join(dir, 'tables'));
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

test('throws when no build-*.js file exists', () => {
    const dir = mkFixtureDir();
    try {
        assert.throws(() => locateBuildVariant(dir), /No liblouis build-\*\.js found/);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

test('throws when a no-tables build exists but tables/ is missing', () => {
    const dir = mkFixtureDir();
    try {
        fs.writeFileSync(path.join(dir, 'build-no-tables-utf32.js'), '');
        assert.throws(() => locateBuildVariant(dir), /Expected a tables\/ directory/);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
