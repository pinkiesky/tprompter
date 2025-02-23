.PHONY: build_info clean build

clean:
	rm -rf ./dist/*

build_copy: 
	cp -r ./src/utils/readData.process.js ./dist/utils/
	cp -r ./src/assets/data ./dist/assets

build_source:
	npx tsc
	chmod +x ./dist/index.js

VERSION := $(shell node -p "require('./package.json').version")
HASH := $(shell git rev-parse HEAD)
build_info:
	sed -e "s/{{VERSION}}/${VERSION}/g" -e "s/{{GIT_HASH}}/${HASH}/g" dist/buildInfo.js > dist/buildInfo.js.tmp
	mv dist/buildInfo.js.tmp dist/buildInfo.js

build: clean build_source build_copy build_info
