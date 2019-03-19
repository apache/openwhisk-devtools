IMG=actionloop/actionloop-demo-python-v3.7:latest
ACT=hello-demo-python

src.zip:
	zip src.zip __main__.py hello.py

bin.zip: src.zip
	docker run -i $(IMG) -compile main <src.zip >bin.zip

single:
	wsk action update $(ACT) hello.py --docker $(IMG) --main hello

src-zip: src.zip
	wsk action update $(ACT) $< --docker $(IMG)

bin-zip: bin.zip
	wsk action update $(ACT) $< --docker $(IMG)

test:
	wsk action invoke $(ACT) -r
	wsk action invoke $(ACT) -p name Mike -r

.PHONE: single src-zip bin-zip



