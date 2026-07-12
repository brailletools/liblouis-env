import fs from 'node:fs';
import path from 'node:path';

import { fetchJsBuildArchive } from './fetchArchive.js';
import { fetchEasyApi } from './fetchEasyApi.js';
import { locateBuildVariant } from './locateVariant.js';
import { JS_BUILD_REF } from './jsBuildVersion.js';
import { EASY_API_REF } from './easyApiVersion.js';

function copyRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    }
}

/**
 * Fetch/cache the pinned liblouis/js-build archive and vendor everything a
 * browser consumer needs — easy-api.js, the chosen build file, and (if needed)
 * the tables directory — into destDir. Writes a manifest.json describing what
 * was written, so consumers don't have to hardcode filenames.
 */
export async function vendorLiblouisAssets(destDir) {
    fs.mkdirSync(destDir, { recursive: true });

    const easyApiPath = await fetchEasyApi();
    fs.copyFileSync(easyApiPath, path.join(destDir, 'easy-api.js'));

    const archiveDir = await fetchJsBuildArchive();
    const variant = locateBuildVariant(archiveDir);
    const buildFileName = path.basename(variant.buildFile);
    fs.copyFileSync(variant.buildFile, path.join(destDir, buildFileName));
    if (variant.needsTables) {
        copyRecursive(variant.tablesDir, path.join(destDir, 'tables'));
    }

    const manifest = {
        generatedAt: new Date().toISOString(),
        jsBuildRef: JS_BUILD_REF,
        easyApiRef: EASY_API_REF,
        easyApiFile: 'easy-api.js',
        buildFile: buildFileName,
        variant: variant.kind, // 'embedded' | 'no-tables'
        tablesDir: variant.needsTables ? 'tables' : null,
    };
    fs.writeFileSync(path.join(destDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    return manifest;
}
