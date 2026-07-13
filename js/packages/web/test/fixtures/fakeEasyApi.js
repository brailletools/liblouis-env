// Fixture shared by fetchEasyApi.test.js and patchEasyApi.test.js: a minimal
// stand-in for upstream easy-api.js that reproduces just enough of
// IMPL.lou.translateString's real shape (see easyApiVersion.js /
// patchEasyApi.js) for the patch's string match to exercise the same code
// path it does against the real file.

const HEADER = `// fake easy-api

var IMPL = {};
IMPL.lou = {
\ttranslateString: function(table, inbuf, backtranslate) {

\t\tif(typeof inbuf !== "string" || inbuf.length === 0) {
\t\t\treturn "";
\t\t}

\t\tvar mode = 0;

`;

const FOOTER = `

\t\tvar outbuff = this.mem.read(this.capi, outbuff_ptr, bufflen_ptr);

\t\tthis.capi._free(outbuff_ptr);
\t\tthis.capi._free(inbuff_ptr);
\t\tthis.capi._free(bufflen_ptr);
\t\tthis.capi._free(strlen_ptr);

\t\treturn this.mem.buffToString(outbuff);
\t},
};
`;

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

export const FAKE_UNPATCHED_EASY_API = HEADER + BUGGY_BLOCK + FOOTER;
export const FAKE_PATCHED_EASY_API = HEADER + FIXED_BLOCK + FOOTER;
