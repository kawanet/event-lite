# Force bash so `set -o pipefail` works in the recipes below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

PLAYWRIGHT_VERSION := 1.62.1

TEST_SRC := ../test/*.js
TEST_DST := tests/bundled.js

ALL := $(TEST_DST)

all: dist $(ALL)

bundled: all

# Keep Playwright out of package.json. CI installs it transiently alongside
# the project's build dependencies, then downloads only the headless shell.
install:
	cd .. && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install playwright@$(PLAYWRIGHT_VERSION) --no-save --ignore-scripts --no-audit --no-fund
	cd .. && npx --no-install playwright install --with-deps --only-shell chromium

# tests.html loads the shipped bundle, so ask the root Makefile for it
# first; whether it rebuilds stays the root Makefile's decision.
dist:
	$(MAKE) -C .. dist/event-lite.min.js

test: all
	cd .. && node browser/tests.cli.mjs

$(TEST_DST): $(TEST_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $(TEST_SRC) --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'assert,../event-lite' \
	--globals 'assert:assert,../event-lite:EventLite' \
	--no-makeAbsoluteExternalsRelative \
	--file $@

clean:
	/bin/rm -fr $(ALL)

.PHONY: all bundled dist install test clean
