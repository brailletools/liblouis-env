// liblouis/js-build (https://github.com/liblouis/js-build) has no semantic
// releases — it's a rolling auto-build of liblouis master, one commit per build.
// This SHA is bumped by hand, the same way ../node/src/version.js's
// LIBLOUIS_VERSION is bumped, but the two are NOT expected to track each other
// exactly: js-build tracks liblouis master by commit, not liblouis release tags.
//
// Pinned commit: "Automatic build of version commit-d1998f", 2017-06-06.
// This corresponds to the liblouis-build@3.2.0-rc npm package (gitHead
// 3a77adf9f20978475d3ff3788c22c6569918694b), a known-good battle-tested build.
// The 2026-06-01 rolling-master pin (0ae24134) was reverted because it crashes
// with abort() inside WASM _free on the first translateString/backTranslateString
// call in a real browser (heap corruption in that upstream master snapshot).
export const JS_BUILD_REPO = 'liblouis/js-build';
export const JS_BUILD_REF = '3a77adf9f20978475d3ff3788c22c6569918694b';
export const JS_BUILD_ARCHIVE_URL = `https://github.com/${JS_BUILD_REPO}/archive/${JS_BUILD_REF}.zip`;
