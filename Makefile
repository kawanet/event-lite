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

all: $(JS_DEST) $(ESM_DEST) $(ESM_TEST) jsdoc

clean:
	rm -fr $(JS_DEST) $(ESM_DEST) $(ESM_TEST)

$(JS_DEST): $(SRC)
	./node_modules/.bin/terser --comments=false -c -m -o $@ $<

test: jshint mocha

mocha: $(JS_DEST) $(ESM_TEST)
	./node_modules/.bin/mocha -R spec $(JS_TEST)
	./node_modules/.bin/mocha -R spec $(ESM_TEST)

jshint:
	./node_modules/.bin/jshint $(SRC) $(JS_TEST)

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

$(ESM_TEST): $(JS_TEST) $(ESM_DEST) Makefile
	mkdir -p $(dir $@)
	./node_modules/.bin/browserify --no-bundle-external --no-builtins --exclude event-lite.js $(JS_TEST) --list
	./node_modules/.bin/browserify --no-bundle-external --no-builtins --exclude event-lite.js $(JS_TEST) |\
	perl -pe 's#^(.*require\()#/// $$1#; s#^#import EventLite from "../event-lite.mjs";\nimport {strict as assert} from "assert";\n\n# if $$. == 1' > $@

####

.PHONY: all clean test jshint jsdoc mocha
