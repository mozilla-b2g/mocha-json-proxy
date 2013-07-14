.PHONY: test
test:
	./node_modules/.bin/mocha --reporter spec \
		test/consumer.js \
		test/acceptance/reporter.js \
		test/acceptance/consumer.js \
		test/reporter.js
	 
