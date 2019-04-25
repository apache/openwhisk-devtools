IMG=actionloop-demo-python-v3.7:latest
ACT=hello-demo-python
PREFIX=docker.io/openwhisk

src.zip: main.rb hello.py
	zip src.zip __main__.py hello.py

bin.zip: src.zip
	docker run -i $(IMG) -compile main <src.zip >bin.zip

test-single:
	wsk action update $(ACT) hello.py --docker $(PREFIX)/$(IMG) --main hello
	wsk action invoke $(ACT) -r
	wsk action invoke $(ACT) -p name Mike -r

test-src-zip: src.zip
	wsk action update $(ACT) $< --docker $(PREFIX)/$(IMG)
	wsk action invoke $(ACT) -r
	wsk action invoke $(ACT) -p name Mike -r

test-bin-zip: bin.zip
	wsk action update $(ACT) $< --docker $(PREFIX)/$(IMG)
	wsk action invoke $(ACT) -r
	wsk action invoke $(ACT) -p name Mike -r

.PHONE: test-single test-src-zip test-bin-zip

