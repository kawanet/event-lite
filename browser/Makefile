# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

TEST_SRC := ../test/*.js
TEST_DST := tests/bundled.mjs

ALL := $(TEST_DST)

all: dist $(ALL)

bundled: all

install:
	cd .. && node ./node_modules/.bin/playwright install chromium --only-shell --with-deps

dist:
	$(MAKE) -C .. dist/event-lite.min.js

test: all install
	cd .. && node ./node_modules/.bin/chromium-js \
	--script dist/event-lite.min.js \
	--alias event-lite=browser/import.mjs \
	browser/tests/bundled.mjs

$(TEST_DST): $(TEST_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $(TEST_SRC) --format esm \
	--plugin '@rollup/plugin-alias={entries:[{find:"../event-lite",replacement:"event-lite"}]}' \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'node:assert,node:test,event-lite' \
	--file $@
	perl -i -pe 's#^(import) (require.*from .node:)#$$1 * as $$2#' $@

clean:
	/bin/rm -fr $(ALL)

.PHONY: all bundled dist install test clean
