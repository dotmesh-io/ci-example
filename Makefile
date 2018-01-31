.PHONY: build test

COMPOSE ?= docker-compose -f docker-compose.yml
COMPOSE_TEST ?= $(COMPOSE) -f docker-compose.test.yml
# if we are in Jenkins or another CI, we will get a build number, else it will just be the usual default
BUILD_ID ?= $(shell basename ${PWD})
VOL_ID ?= ciexample

build:
	$(COMPOSE_TEST) -p $(BUILD_ID) build

test:
	$(COMPOSE_TEST) -p $(BUILD_ID) run test

