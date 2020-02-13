#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

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

