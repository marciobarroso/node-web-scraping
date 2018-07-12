NPM_BIN=./node_modules/.bin
TEST_ENV=NODE_ENV=test NODE_PATH=./src:./test
NODE_ENV ?= dev

clean:
	rm -rf ./build

build: clean
	$(NPM_BIN)/babel src -d ./build

start: build
	NODE_ENV=$(NODE_ENV) NODE_PATH=./build node ./build/index.js --presets es2015,stage-2