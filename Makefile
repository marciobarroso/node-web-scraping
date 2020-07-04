clean:
	rm -rf ./build ./administrators.xlsx

start:
	node --max-old-space-size=8192 ./src/index.js