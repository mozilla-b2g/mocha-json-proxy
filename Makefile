.PHONY: test
test:
	./node_modules/.bin/mocha --reporter spec \
		test/acceptance/reporter.js \
		test/consumer.js \
		test/reporter.js
	 
