.PHONY: dev build install clean

PORT ?= 5180

install:
	npm install

dev: install
	npm run dev -- --port $(PORT)

build: install
	npm run build

preview: build
	npm run preview -- --port $(PORT)

clean:
	rm -rf dist node_modules
