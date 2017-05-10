
SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

.PHONY: server
server: node_modules protocol/service.d.ts
	ts-node server/server.ts

.PHONY: dreamer
dreamer: model
	python3 -u dreamer/server.py

.PHONY: preview
preview: node_modules protocol/service.d.ts
	wintersmith preview --chdir client

.PHONY: build
build: node_modules protocol/service.d.ts
	wintersmith build --chdir client -o ../build
	uglifyjs build/dream.js \
  		--source-map "content=inline,url=dream.js.map,filename=build/dream.js.map" \
  		--compress "dead_code,collapse_vars,reduce_vars,keep_infinity,drop_console,passes=2" \
  		-o build/dream.js

model:
	wget https://storage.googleapis.com/download.tensorflow.org/models/inception5h.zip
	unzip -d model inception5h.zip
	rm inception5h.zip

protocol/service.js: node_modules protocol/service.proto
	pbjs -t static-module -w commonjs protocol/service.proto -o protocol/service.js

protocol/service.d.ts: node_modules protocol/service.js
	pbts -o protocol/service.d.ts protocol/service.js

node_modules:
	npm install

.PHONY: clean
clean:
	rm -rf build
	rm -f protocol/service.js
	rm -f protocol/service.d.ts

.PHONY: distclean
distclean: clean
	rm -rf model
	rm -rf node_modules
