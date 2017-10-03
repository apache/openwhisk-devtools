SOURCEDIR=.

SOURCES := $(shell find $(SOURCEDIR) -name '*.go')
BINARY=terraform-provider-example

VERSION=1.0.0

BUILD=`git rev-parse HEAD`

# Build the project
build:deps
	go build ${LDFLAGS} -o ${BINARY}

deps:
	@echo "Installing dependencies"
	go get -d -t ./...

LDFLAGS=-ldflags "-X main.Version=`date -u '+%Y-%m-%dT%H:%M:%S'` -X main.Build=`git rev-parse HEAD` "


