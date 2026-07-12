import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { resolveLouTranslate } from '../src/index.js';

test('resolveLouTranslate returns LOU_TRANSLATE_PATH when set', () => {
    const previous = process.env.LOU_TRANSLATE_PATH;
    process.env.LOU_TRANSLATE_PATH = '/some/fake/path/lou_translate';
    try {
        assert.equal(resolveLouTranslate(), '/some/fake/path/lou_translate');
    } finally {
        if (previous === undefined) delete process.env.LOU_TRANSLATE_PATH;
        else process.env.LOU_TRANSLATE_PATH = previous;
    }
});

test('resolveLouTranslate finds a binary on PATH', (t) => {
    if (process.platform === 'win32') {
        t.skip('PATH lookup test targets which(1), not where.exe');
        return;
    }

    const previousEnvPath = process.env.LOU_TRANSLATE_PATH;
    delete process.env.LOU_TRANSLATE_PATH;

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'liblouis-env-test-'));
    const binPath = path.join(dir, 'lou_translate');
    fs.writeFileSync(binPath, '#!/bin/sh\necho fake\n', { mode: 0o755 });

    const previousPath = process.env.PATH;
    process.env.PATH = `${dir}${path.delimiter}${previousPath}`;

    try {
        const found = resolveLouTranslate();
        assert.equal(found, binPath);
    } finally {
        process.env.PATH = previousPath;
        if (previousEnvPath !== undefined) process.env.LOU_TRANSLATE_PATH = previousEnvPath;
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

test('resolveLouTranslate returns null when nothing is found', () => {
    const previousEnvPath = process.env.LOU_TRANSLATE_PATH;
    const previousPath = process.env.PATH;
    delete process.env.LOU_TRANSLATE_PATH;
    process.env.PATH = fs.mkdtempSync(path.join(os.tmpdir(), 'liblouis-env-empty-path-'));

    try {
        assert.equal(resolveLouTranslate(), null);
    } finally {
        process.env.PATH = previousPath;
        if (previousEnvPath !== undefined) process.env.LOU_TRANSLATE_PATH = previousEnvPath;
    }
});
