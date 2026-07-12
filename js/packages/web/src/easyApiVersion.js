// easy-api.js is hand-written glue code (not emscripten output) that lives in
// liblouis/liblouis-js, a separate repo from liblouis/js-build (see
// jsBuildVersion.js). That repo went dormant after a 2020 reorg that intended to
// fold js-build into it — js-build stayed the active one instead — so this file
// is also pinned to a specific commit rather than assumed to be evergreen.
//
// Pinned commit: HEAD of liblouis/liblouis-js as of this writing, 2020-12-11
// ("Move the json files of the js-build repo to this repo").
export const EASY_API_REPO = 'liblouis/liblouis-js';
export const EASY_API_REF = 'a91a717ea2b21364b4f766062b11777714beabf2';
export const EASY_API_RAW_URL = `https://raw.githubusercontent.com/${EASY_API_REPO}/${EASY_API_REF}/easy-api.js`;
