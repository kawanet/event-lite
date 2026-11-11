# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

TEST_SRC := ../test/*.js
TEST_DST := tests/bundled.mjs

# CI sets CDP_PORT to attach to a running Chrome over CDP instead of installing one.
PLAYWRIGHT_CONFIG := tests/playwright-config.json

ALL := $(TEST_DST) $(PLAYWRIGHT_CONFIG)

all: dist $(ALL)

bundled: all

install:
	if [ -z "$(CDP_PORT)" ]; then \
		cd .. && node ./node_modules/.bin/playwright install chromium --only-shell --with-deps; \
	fi

dist:
	$(MAKE) -C .. dist/event-lite.min.js

test: all install
	cd .. && node ./node_modules/.bin/chromium-js \
	--playwright-config browser/$(PLAYWRIGHT_CONFIG) \
	--script dist/event-lite.min.js \
	--alias event-lite=browser/import.mjs \
	--test browser/tests/bundled.mjs

$(PLAYWRIGHT_CONFIG): Makefile
	mkdir -p $(dir $@)
	if [ -n "$(CDP_PORT)" ]; then \
		echo '{"connectOverCDP": "http://127.0.0.1:$(CDP_PORT)"}' > $@; \
	else \
		echo '{}' > $@; \
	fi

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
