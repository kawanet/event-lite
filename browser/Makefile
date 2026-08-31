#!/usr/bin/env bash -c make

TEST_SRC := ../test/*.js
TEST_DST := tests/bundled.js

ALL := $(TEST_DST)

all: $(ALL)

test: all

$(TEST_DST): $(TEST_SRC) Makefile
	mkdir -p $(dir $@)
	../node_modules/.bin/rollup $(TEST_SRC) --format iife \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'assert,../event-lite' |\
	perl -pe 's#^}\)\(require.*\);#})(assert, EventLite)#' > $@

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test
