#!/usr/bin/env node
// liblouis-fetch: explicitly resolve/install lou_translate ahead of time.
//
// Useful in CI or Docker builds where you don't want the first call to
// getLouTranslate() to trigger a network call.

import { getLouTranslate } from '../src/index.js';

const path = await getLouTranslate();
console.log(path);
