#!/usr/bin/env bash -c make

JS_TEST=../test/*.js
ALL=assert.browser.js test.browser.js

all: $(ALL)

test: all
	open test.html

test.browser.js: $(JS_TEST) Makefile
	../node_modules/.bin/rollup $(JS_TEST) --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'assert,../event-lite' |\
	perl -pe 's#^}\)\(require.*\);#})(assert, EventLite)#' > $@

assert.browser.js: ../node_modules/assert/assert.js Makefile
	../node_modules/.bin/rollup $< --file $@ --format iife --name assert \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-node-resolve='{"browser":true, "preferBuiltins":false}'

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test
