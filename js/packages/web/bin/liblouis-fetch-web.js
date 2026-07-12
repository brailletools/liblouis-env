#!/usr/bin/env node
// liblouis-fetch-web <dest-dir>: vendor a liblouis browser build + tables into
// dest-dir, replacing hand-copied static assets with a versioned, reproducible
// fetch step. Writes manifest.json into dest-dir describing what was written.

import { vendorLiblouisAssets } from '../src/vendor.js';

const dest = process.argv[2];
if (!dest) {
    console.error('Usage: liblouis-fetch-web <dest-dir>');
    process.exit(1);
}

const manifest = await vendorLiblouisAssets(dest);
console.log(`Wrote liblouis web assets to ${dest} (variant: ${manifest.variant}, build file: ${manifest.buildFile})`);
