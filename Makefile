.PHONY: test
test:
	./node_modules/.bin/mocha --reporter spec \
		test/acceptance/reporter.js \
		test/runner.js \
		test/reporter.js
	 
