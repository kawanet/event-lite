#!/usr/bin/env bash -c make

SRC=./event-lite.js
JS_DEST=./dist/event-lite.min.js
JS_TEST=test/*.js

DOCS_DIR=./gh-pages
DOC_HTML=./gh-pages/index.html
DOCS_CSS_SRC=./assets/jsdoc.css
DOCS_CSS_DEST=./gh-pages/styles/jsdoc-default.css

ESM_DEST=./event-lite.mjs
ESM_TEST=./test/test.mjs

MINJS_MAX_BYTES := 2000
ESM_MAX_BYTES := 6000
NAMED_EXPORTS := EventLite
METHODS := on once off emit

all: $(JS_DEST) $(ESM_DEST) $(ESM_TEST) jsdoc

clean:
	rm -fr $(JS_DEST) $(ESM_DEST) $(ESM_TEST)

$(JS_DEST): $(SRC)
	./node_modules/.bin/terser --comments=false -c -m -o $@ $<
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(MINJS_MAX_BYTES) || { echo "ERROR: $@ exceeds $(MINJS_MAX_BYTES) byte cap" >&2; exit 1; }

test: jshint mocha smoke

mocha: $(JS_DEST) $(ESM_TEST)
	./node_modules/.bin/mocha -R spec $(JS_TEST)
	./node_modules/.bin/mocha -R spec $(ESM_TEST)

jshint:
	./node_modules/.bin/jshint $(SRC) $(JS_TEST)

# Note: process.argv.slice(1) is used because `node -e 'code' arg1 arg2`
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: smoke-mjs smoke-cjs smoke-minjs

# MJS smoke test via public entrypoint. The package default exports the
# constructor, so the documented methods sit on its prototype.
smoke-mjs: $(ESM_DEST)
	node --input-type=module -e 'const m = await import("event-lite"); for (const k of process.argv.slice(1)) { if (typeof m.default.prototype[k] !== "function") { console.error("missing MJS method:", k); process.exit(1); } console.log("MJS method OK:", k); }' $(METHODS)

# CJS smoke test via public entrypoint.
smoke-cjs: $(SRC)
	node --input-type=commonjs -e 'const m = require("event-lite"); for (const k of process.argv.slice(1)) { if (typeof m.prototype[k] !== "function") { console.error("missing CJS method:", k); process.exit(1); } console.log("CJS method OK:", k); }' $(METHODS)

# Smoke the .min.js in two consumer shapes:
#  (1) browser <script>: the bundle leaves a namespace global behind, so
#      look the exports up as properties of that global.
#  (2) CJS require(): the same file is published to a CDN and pulled in
#      by bundlers, so it stays usable as a CommonJS module.
smoke-minjs: $(JS_DEST)
	(cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof globalThis[k] !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)
	node --input-type=commonjs -e 'const m = require("$(JS_DEST)"); for (const k of process.argv.slice(1)) { if (typeof m.prototype[k] !== "function") { console.error("missing minjs CJS method:", k); process.exit(1); } console.log("minjs CJS method OK:", k); }' $(METHODS)

jsdoc: $(DOC_HTML)

$(DOC_HTML): README.md $(SRC) $(DOCS_CSS_SRC)
	mkdir -p $(DOCS_DIR)
	./node_modules/.bin/jsdoc -d $(DOCS_DIR) -R README.md $(SRC)
	cat $(DOCS_CSS_SRC) >> $(DOCS_CSS_DEST)
	rm -f $(DOCS_DIR)/*.js.html
	for f in $(DOCS_DIR)/*.html; do perl -i -pe 's#</a> on .* 202.* GMT.*##' $$f; done
	for f in $(DOCS_DIR)/*.html; do perl -i -pe 's#<a href=".*.js.html">.*line.*line.*</a>##' $$f; done

#### ES Module

$(ESM_DEST): $(SRC) Makefile
	mkdir -p $(dir $@)
	perl -pe 's#^(\s*)(\S.*(\(EventLite\)|module.exports))#$$1// $$2#; s#^(function)#export default $$1#' < $< > $@
	diff $< $@ || true
	@ls -l $@
	@test "$$(wc -c < $@)" -le $(ESM_MAX_BYTES) || { echo "ERROR: $@ exceeds $(ESM_MAX_BYTES) byte cap" >&2; exit 1; }

$(ESM_TEST): $(JS_TEST) $(ESM_DEST) Makefile
	mkdir -p $(dir $@)
	./node_modules/.bin/rollup $(JS_TEST) --format esm \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'assert,../event-lite' |\
	perl -pe 's#^(import require.*? from .)/.*(.;)#$$1../event-lite.mjs$$2#' > $@

####

.PHONY: all clean test jshint jsdoc mocha smoke smoke-mjs smoke-cjs smoke-minjs
