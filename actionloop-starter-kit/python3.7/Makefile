IMG=actionloop-demo-python-v3.7:latest
INVOKE=python ../tools/invoke.py
PREFIX=docker.io/actionloop

build:
	docker build -t $(IMG) .

push: build
	docker login
	docker tag $(IMG) $(PREFIX)/$(IMG) 
	docker push $(PREFIX)/$(IMG)

clean:
	docker rmi -f $(IMG)

start: build
	docker run -p 8080:8080 -ti -v $(PWD):/proxy $(IMG) 

debug: build
	docker run -p 8080:8080 -ti --entrypoint=/bin/sh -v $(PWD):/proxy $(IMG) 

.PHONY: build push clean start debug

## You need to execute make start in another terminal 
test-single:
	$(INVOKE) init hello ../example/hello.py
	$(INVOKE) run '{}'
	$(INVOKE) run '{"name":"Mike"}'

test-src-zip:
	$(MAKE) -C ../example src.zip
	$(INVOKE) init ../example/src.zip
	$(INVOKE) run '{}'
	$(INVOKE) run '{"name":"Mike"}'

test-bin-dir:
	$(MAKE) -C ../example bin.zip
	$(INVOKE) init ../example/bin.zip
	$(INVOKE) run '{}'
	$(INVOKE) run '{"name":"Mike"}'
