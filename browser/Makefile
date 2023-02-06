#!/usr/bin/env bash -c make

all: test.browserify.js

test: all
	open test.html

test.browserify.js:
	../node_modules/.bin/browserify ../test/*.js \
		-t [ browserify-sed 's#require\("../event-lite"\)#require("../browser/import")#' ] \
		--list | sort
	../node_modules/.bin/browserify ../test/*.js \
		-t [ browserify-sed 's#require\("../event-lite"\)#require("../browser/import")#' ] \
		 -o $@
	 ls -l $@

clean:
	/bin/rm -fr test.browserify.js

.PHONY: all clean test
