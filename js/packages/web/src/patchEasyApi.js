// liblouis/liblouis-js has been dormant since 2020-12-11 (see easyApiVersion.js),
// so a real bug in the pinned easy-api.js can't be fixed by bumping EASY_API_REF —
// it's presumably present at every commit. Patch it in-place after fetching instead.
//
// Bug: IMPL.lou.translateString sizes the output buffer to exactly the input's
// byte length, with zero margin, for both translateString and
// backTranslateString (they share this code path). liblouis output routinely
// needs more space than the input — numeric/capital indicators, multi-cell
// punctuation, grade-2 contraction back-translation, etc. — so this silently
// overflows the WASM heap for a large fraction of real inputs. The overflow
// corrupts adjacent heap allocations; the crash doesn't surface until a later,
// unrelated _free() call (abort() inside _free), which made it look
// non-deterministic/input-dependent rather than reliably reproducible.
//
// Fix: give the output buffer a generous, fixed-minimum margin instead of
// sizing it to the input. Also fixes an adjacent leak: the original
// `if(!success) { return null; }` skipped freeing all four buffers.

const BUGGY_BLOCK = `\t\tvar inbuff_ptr = this.mem.transfer(this.capi, inbuf);
\t\tvar bufflen = this.mem.getBufferLength(inbuf);
\t\tvar outbuff_ptr = this.capi._malloc(bufflen);

\t\tvar bufflen_ptr = this.capi._malloc(4);
\t\tvar strlen_ptr = this.capi._malloc(4);

\t\tthis.capi.setValue(bufflen_ptr, bufflen, "i32");
\t\tthis.capi.setValue(strlen_ptr, bufflen, "i32");

\t\tvar success = this.capi.ccall(backtranslate ?
\t\t\t\t'lou_backTranslateString' :
\t\t\t\t'lou_translateString', 'number', ['string',
\t\t\t\t'number', 'number', 'number', 'number',
\t\t\t\t'number', 'number'], [table, inbuff_ptr,
\t\t\t\tstrlen_ptr, outbuff_ptr, bufflen_ptr, null,
\t\t\t\tnull, mode]);

\t\tif(!success) {
\t\t\treturn null;
\t\t}`;

const FIXED_BLOCK = `\t\tvar inbuff_ptr = this.mem.transfer(this.capi, inbuf);
\t\tvar bufflen = this.mem.getBufferLength(inbuf);
\t\t// liblouis output can need substantially more cells/characters than the
\t\t// input; sizing the output buffer to exactly the input length silently
\t\t// overflows the WASM heap for many real inputs, corrupting adjacent
\t\t// allocations and crashing later (typically inside a subsequent _free()).
\t\t// Use a generous, fixed-minimum margin for both directions.
\t\tvar outCapacity = Math.max(bufflen * 32, 2048);
\t\tvar outbuff_ptr = this.capi._malloc(outCapacity);

\t\tvar bufflen_ptr = this.capi._malloc(4);
\t\tvar strlen_ptr = this.capi._malloc(4);

\t\tthis.capi.setValue(bufflen_ptr, outCapacity, "i32");
\t\tthis.capi.setValue(strlen_ptr, bufflen, "i32");

\t\tvar success = this.capi.ccall(backtranslate ?
\t\t\t\t'lou_backTranslateString' :
\t\t\t\t'lou_translateString', 'number', ['string',
\t\t\t\t'number', 'number', 'number', 'number',
\t\t\t\t'number', 'number'], [table, inbuff_ptr,
\t\t\t\tstrlen_ptr, outbuff_ptr, bufflen_ptr, null,
\t\t\t\tnull, mode]);

\t\tif(!success) {
\t\t\tthis.capi._free(outbuff_ptr);
\t\t\tthis.capi._free(inbuff_ptr);
\t\t\tthis.capi._free(bufflen_ptr);
\t\t\tthis.capi._free(strlen_ptr);
\t\t\treturn null;
\t\t}`;

/**
 * Apply the translateString/backTranslateString buffer-overflow fix to a
 * freshly-downloaded easy-api.js source string. Line endings (CRLF in
 * upstream's file) are normalized to LF; matching is done LF-only.
 *
 * Throws if the buggy block isn't found, rather than silently passing
 * unpatched (and unsafe) content through — if upstream's source changes
 * shape at EASY_API_REF, this needs to be re-verified and updated by hand
 * before it's safe to trust again.
 */
export function patchEasyApi(source) {
    const normalized = source.replace(/\r\n/g, '\n');
    if (!normalized.includes(BUGGY_BLOCK)) {
        throw new Error(
            'patchEasyApi: expected buggy translateString block not found in ' +
                'fetched easy-api.js. Upstream content at the pinned EASY_API_REF ' +
                'may have changed shape — update patchEasyApi.js before proceeding, ' +
                'since serving this file unpatched risks the WASM heap-overflow ' +
                'crash (abort() inside _free) that this patch exists to fix.'
        );
    }
    return normalized.replace(BUGGY_BLOCK, FIXED_BLOCK);
}
