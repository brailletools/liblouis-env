// liblouis/js-build (https://github.com/liblouis/js-build) has no semantic
// releases — it's a rolling auto-build of liblouis master, one commit per build.
// This SHA is bumped by hand, the same way ../node/src/version.js's
// LIBLOUIS_VERSION is bumped, but the two are NOT expected to track each other
// exactly: js-build tracks liblouis master by commit, not liblouis release tags.
//
// Pinned commit: "Automatic build of version commit-65d969", 2026-06-01 — the
// current tip of liblouis/js-build.
export const JS_BUILD_REPO = 'liblouis/js-build';
export const JS_BUILD_REF = '0ae24134c7005586acf406e53f1e3788fae0452f';
export const JS_BUILD_ARCHIVE_URL = `https://github.com/${JS_BUILD_REPO}/archive/${JS_BUILD_REF}.zip`;
