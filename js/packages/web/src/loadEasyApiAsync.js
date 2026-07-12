// Browser-only. Loads the vendored easy-api.js (written as a UMD script, no
// native `export`) via a classic <script> tag rather than import(), and reads
// the LiblouisEasyApiAsync class off the resulting global — see easy-api.js's
// UMD tail: `ns.LiblouisEasyApiAsync = LiblouisEasyApiAsync` in its
// browser-global branch, where `ns` is `window` for a classic script load.
//
// This exists so the *same* fetched/vendored file (see vendor.js) is the only
// source of easy-api.js in a consuming app — no separate copy from the
// abandoned npm `liblouis` package.

export function loadEasyApiAsync(easyApiUrl) {
    if (window.LiblouisEasyApiAsync) {
        return Promise.resolve(window.LiblouisEasyApiAsync);
    }

    const existing = document.querySelector(`script[src="${easyApiUrl}"]`);
    if (existing) {
        return new Promise((resolve, reject) => {
            existing.addEventListener('load', () => resolveOrReject(easyApiUrl, resolve, reject));
            existing.addEventListener('error', () => reject(new Error(`Failed to load liblouis script from ${easyApiUrl}`)));
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = easyApiUrl;
        script.addEventListener('load', () => resolveOrReject(easyApiUrl, resolve, reject));
        script.addEventListener('error', () => reject(new Error(`Failed to load liblouis script from ${easyApiUrl}`)));
        document.head.appendChild(script);
    });
}

function resolveOrReject(easyApiUrl, resolve, reject) {
    if (window.LiblouisEasyApiAsync) {
        resolve(window.LiblouisEasyApiAsync);
    } else {
        reject(new Error(`Loaded ${easyApiUrl} but it did not define window.LiblouisEasyApiAsync`));
    }
}
