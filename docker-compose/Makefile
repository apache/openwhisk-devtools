UNAME_STR ?= $(shell uname)

# detect local ip of host as this is needed within containers to find the openwhisk API container
ifeq ("$(UNAME_STR)","Linux")
	LOCAL_IP=$(shell route | grep default | tr -s " " | cut -d " " -f 8 | xargs ifconfig | grep "inet addr:" | cut -d ":" -f 2 | cut -d " " -f 1)
else
	LOCAL_IP ?= $(shell ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d\  -f2 | head -1)
	# if no IP was found, fallback to "localhost"
	ifeq ($(LOCAL_IP), )
		LOCAL_IP = "localhost"
	endif
endif

DOCKER_HOST_IP ?= $(shell echo ${DOCKER_HOST} | grep -o "[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}" || echo ${LOCAL_IP})
DOCKER_REGISTRY ?= ""
DOCKER_IMAGE_PREFIX ?= openwhisk
PROJECT_HOME ?= ./openwhisk-master
CATALOG_HOME ?= ./openwhisk-catalog
WSK_CLI ?= $(PROJECT_HOME)/bin/wsk
OPEN_WHISK_DB_PREFIX ?= local_

DOCKER_KERNEL ?= $(shell docker version --format "{{.Server.KernelVersion}}")
ifeq ("$(UNAME_STR)","Linux")
	DOCKER_BINARY ?= $(shell (which docker))
else 
	DOCKER_BINARY ?= $(shell if [[ $(DOCKER_KERNEL) == *-moby || $(DOCKER_KERNEL) ==  *-boot2docker ]]; then (docker run --rm --privileged --pid=host debian nsenter -t 1 -m -u -n -i sh -c "which docker"); else (which docker); fi)
endif
ifndef VERBOSE
.SILENT:
endif

# Quick-Start is a simple way to get started with OpenWhisk locally
#   1. at start it builds the project and the docker containers
#   2. then it starts all components using docker-compose
#   3. it runs a sample hello-world function
#   To stop and cleanup the environment use: make destroy
quick-start: download download-cli run quick-start-pause hello-world quick-start-info

add-catalog: download-catalog init-catalog

.PHONY: download
download:
	rm -rf ./openwhisk-master*
	if [ "$(PROJECT_HOME)" = "./openwhisk-master" ]; then \
        echo "Downloading source tar ball...."; \
	    curl -o ./openwhisk-master.tar.gz -L https://github.com/apache/incubator-openwhisk/archive/master.tar.gz; \
        echo "Unpacking tarball."; \
	    mkdir openwhisk-master; \
	    tar -xf ./openwhisk-master.tar.gz --strip 1 -C openwhisk-master; \
	else \
	     echo "Skipping downloading the code from git as PROJECT_HOME is not default:" $(PROJECT_HOME); \
	fi

.PHONY: download-catalog
download-catalog:
	rm -rf ./openwhisk-catalog*
	if [ "$(CATALOG_HOME)" = "./openwhisk-catalog" ]; then \
	    curl -O ./openwhisk-catalog.tar.gz -L https://api.github.com/repos/apache/incubator-openwhisk-catalog/tarball/master > ./openwhisk-catalog.tar.gz; \
	    mkdir openwhisk-catalog; \
	    tar -xf ./openwhisk-catalog.tar.gz --strip 1 -C openwhisk-catalog; \
	else \
	     echo "Skipping downloading the code from git as CATALOG_HOME is not default:" $(CATALOG_HOME); \
	fi

.PHONY: quick-start-pause
quick-start-pause:
	echo "waiting for the Whisk invoker to come up ... "
	until $$(curl --output /dev/null --silent --head --fail http://$(DOCKER_HOST_IP):8085/ping); do printf '.'; sleep 5; done
	sleep 30

.PHONY: quick-start-info
quick-start-info:
	echo "$$(tput setaf 2)To invoke the function again use: $$(tput setaf 4)make hello-world$$(tput sgr0)"
	echo "$$(tput setaf 2)To stop openwhisk use: $$(tput setaf 4)make destroy$$(tput sgr0)"

docker:
	echo "building the docker images ... "
	cd $(PROJECT_HOME) && \
		./gradlew distdocker -x :core:swift3Action:distDocker -x :core:swiftAction:distDocker

download-cli:
	echo "downloading the CLI tool ... "
	if [ "$(PROJECT_HOME)" = "./openwhisk-master" ]; then \
        if [ "$(UNAME_STR)" = "Darwin" ]; then \
          echo "downloading cli for mac" ; \
          curl -o $(PROJECT_HOME)/bin/wsk.zip -L https://github.com/apache/incubator-openwhisk-cli/releases/download/latest/OpenWhisk_CLI-latest-mac-amd64.zip ; \
            cd $(PROJECT_HOME)/bin ; \
        unzip -o wsk.zip; \
        elif [ "$(UNAME_STR)" = "Linux" ]; then \
          echo "downloading cli for linux" ; \
          curl -o $(PROJECT_HOME)/bin/wsk.tgz -L https://github.com/apache/incubator-openwhisk-cli/releases/download/latest/OpenWhisk_CLI-latest-linux-amd64.tgz ; \
            cd $(PROJECT_HOME)/bin ; \
            tar -xf wsk.tgz ; \
        fi; \
	else \
         echo "Skipping downloading the cli from git as PROJECT_HOME is not default:" $(PROJECT_HOME); \
	fi

.PHONY: run
run: print-host check-required-ports setup start-docker-compose init-couchdb init-whisk-cli

print-host:
	echo "host ip address: ${DOCKER_HOST_IP}"

.PHONY: check-required-ports
check-required-ports:
	echo "checking required ports ... "
	for port in 80 443 2888 5984 8085 8888 9092 2888 8001; do \
		pid=`lsof -Pi :$$port -sTCP:LISTEN -t` ; \
		if [ ! -z "$$pid" ];  then echo "$$(tput setaf 1)Port $$port is taken by PID:$$pid.$$(tput sgr0)"; exit 1; fi; \
	done
	echo " ... OK"

.PHONY: check-alarm-ports
check-alarm-ports:
	echo "checking required ports ... "
	for port in 8081; do \
		pid=`lsof -Pi :$$port -sTCP:LISTEN -t` ; \
		if [ ! -z "$$pid" ];  then echo "$$(tput setaf 1)Port $$port is taken by PID:$$pid.$$(tput sgr0)"; exit 1; fi; \
	done
	echo " ... OK"

.PHONY: check-cloudant-ports
check-cloudant-ports:
	echo "checking required ports ... "
	for port in 8082; do \
		pid=`lsof -Pi :$$port -sTCP:LISTEN -t` ; \
		if [ ! -z "$$pid" ];  then echo "$$(tput setaf 1)Port $$port is taken by PID:$$pid.$$(tput sgr0)"; exit 1; fi; \
	done
	echo " ... OK"

.PHONY: check-kafka-ports
check-kafka-ports:
	echo "checking required ports ... "
	for port in 5000; do \
		pid=`lsof -Pi :$$port -sTCP:LISTEN -t` ; \
		if [ ! -z "$$pid" ];  then echo "$$(tput setaf 1)Port $$port is taken by PID:$$pid.$$(tput sgr0)"; exit 1; fi; \
	done
	echo " ... OK"




.PHONY: setup
setup:
	mkdir -p ~/tmp/openwhisk/apigateway/ssl
	$(PROJECT_HOME)/ansible/files/genssl.sh $(DOCKER_HOST_IP) server $(PROJECT_HOME)/ansible/roles/nginx/files
	cp $(PROJECT_HOME)/ansible/roles/nginx/files/*.pem ~/tmp/openwhisk/apigateway/ssl
	cp -r ./apigateway/* ~/tmp/openwhisk/apigateway/
	> ~/tmp/openwhisk/local.env
	printf "DOCKER_BINARY=$(DOCKER_BINARY)\n" >> ~/tmp/openwhisk/local.env
	printf "DOCKER_COMPOSE_HOST=$(DOCKER_HOST_IP)\n" >> ~/tmp/openwhisk/local.env
	printf "DOCKER_REGISTRY=$(DOCKER_REGISTRY)\n" >> ~/tmp/openwhisk/local.env
	printf "DOCKER_IMAGE_PREFIX=$(DOCKER_IMAGE_PREFIX)\n" >> ~/tmp/openwhisk/local.env

.PHONY: restart
restart: stop rm start-docker-compose

.PHONY: restart-controller
restart-controller:
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk stop controller
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk rm -f controller
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk up controller 2>&1 >> ~/tmp/openwhisk/docker-compose.log &
	echo "waiting for the controller to see the invoker is 'up' ... "
	until (curl --silent http://$(DOCKER_HOST_IP):8888/invokers | grep "up"); do printf '.'; sleep 5; done

.PHONY: restart-invoker
restart-invoker:
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk stop invoker
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk rm -f invoker
	echo "waiting for the invoker to be marked 'down' ... "
	until (curl --silent http://$(DOCKER_HOST_IP):8888/invokers | grep "down"); do printf '.'; sleep 5; done
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk up invoker 2>&1 >> ~/tmp/openwhisk/docker-compose.log &
	echo "waiting for the invoker to be marked Healthy ... "
	until (curl --silent http://$(DOCKER_HOST_IP):8888/invokers | grep "up"); do printf '.'; sleep 5; done

.PHONY: start-docker-compose
start-docker-compose:
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk up 2>&1 > ~/tmp/openwhisk/docker-compose.log &

.PHONY: stop
stop:
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk stop

.PHONY: rm
rm:
	$(shell cat ~/tmp/openwhisk/local.env) docker-compose --project-name openwhisk rm -f

.PHONY: init-couchdb
init-couchdb:
	echo "waiting for the database to come up ... on $(DOCKER_HOST_IP)"
	until $$(curl --output /dev/null --silent --head --fail http://$(DOCKER_HOST_IP):5984/_all_dbs); do printf '.'; sleep 5; done
	echo "initializing the database ... on $(DOCKER_HOST_IP)"
	# make sure the src files are in a shared folder for docker
	mkdir -p ~/tmp/openwhisk
	rm -rf ~/tmp/openwhisk/src
	rsync -a $(PROJECT_HOME)/* ~/tmp/openwhisk/src --exclude .git --exclude build --exclude tests
	echo 'Setting up db using ansible container....'; \
    compose_network=$$(docker-compose --project-name openwhisk ps -q db 2>/dev/null | xargs docker inspect -f '{{range $$index, $$element := .NetworkSettings.Networks}}{{$$index}}{{end}}' | head -n 1); \
    db_ip_address=$$(docker-compose --project-name openwhisk ps -q db 2>/dev/null | xargs docker inspect -f "{{.NetworkSettings.Networks.$${compose_network}.IPAddress}}"); \
	docker run --rm -v ~/tmp/openwhisk/src:/openwhisk -w /openwhisk/ansible \
		--network="$${compose_network}" -t \
		--add-host="db:$${db_ip_address}" \
		ddragosd/ansible:2.3.1.0-debian8  \
		sh -c "ansible-playbook setup.yml && ansible-playbook couchdb.yml --tags=ini && ansible-playbook initdb.yml wipe.yml \
			-e db_host=db -e openwhisk_home=/openwhisk -e db_prefix=$(OPEN_WHISK_DB_PREFIX)"

.PHONY: init-whisk-cli
init-whisk-cli:
	echo "waiting for the Whisk controller to come up ... "
	until $$(curl --output /dev/null --silent --head --fail http://$(DOCKER_HOST_IP):8888/ping); do printf '.'; sleep 5; done
	echo "initializing CLI ... "
	$(WSK_CLI) -v property set --namespace guest --auth `cat $(PROJECT_HOME)/ansible/files/auth.guest` --apihost $(DOCKER_HOST_IP):443 -i


.PHONY: init-catalog
init-catalog:
	OPENWHISK_HOME=$(PROJECT_HOME) $(CATALOG_HOME)/packages/installCatalog.sh \
	  `cat $(PROJECT_HOME)/ansible/files/auth.whisk.system` \
	  $(DOCKER_HOST_IP):443 \
	  $(WSK_CLI)

.PHONY: destroy
destroy: stop rm
	echo "cleaning other openwhisk containers started by the invoker ... "
	docker ps | grep whisk | awk '{print $$1}' | xargs docker stop | xargs docker rm
	echo "cleaning dangling docker volumes ... "
	docker volume ls -qf dangling=true | xargs docker volume rm
	if [ "$(UNAME_STR)" = "Linux" ]; then \
	  sudo rm -rf ~/tmp/openwhisk ;\
	else \
	  rm -rf ~/tmp/openwhisk ;\
	fi;
	rm -rf ./openwhisk-master*

# This task runs a hello-world function
#   1. It creates the function
#   2. It executes it
#   3. At the end it deletes it
.PHONY: hello-world
hello-world: create-hello-world-function
	echo "invoking the hello-world function ... "

	echo "$$(tput setaf 4)adding the function to whisk ...$$(tput sgr0)"
	$(WSK_CLI) -i action create hello hello.js

	echo "$$(tput setaf 4)invoking the function ...$$(tput sgr0)"
	res=`$(WSK_CLI) -i action invoke hello --blocking --result` \
	    && echo "invokation result:" $$res \
	    && (echo $$res | grep "Hello, World") || ($(WSK_CLI) -i action delete hello && tail -n 200 ~/tmp/openwhisk/invoker/logs/invoker-local_logs.log ~/tmp/openwhisk/controller/logs/controller-local_logs.log && exit 1)

	echo "$$(tput setaf 1)deleting the function ...$$(tput sgr0)"
	$(WSK_CLI) -i action delete hello
	rm hello.js

.PHONY: create-hello-world-function
create-hello-world-function:
	echo "$$(tput setaf 2)creating the hello.js function ...$$(tput sgr0)"
	echo 'function main(params) {var name = params.name || "World"; return { payload:  "Hello, " + name + "!" }; }' > hello.js

# Using the hello-world function this task executes a performance test using Apache Benchmark
.PHONY: hello-world-perf-test
hello-world-perf-test: create-hello-world-function
	$(WSK_CLI) -i action create hello-perf hello.js

	docker run \
	    --net openwhisk_default \
	    --link controller jordi/ab ab -k -n 2000 -c 20 \
	    -m POST -H "Authorization:Basic MjNiYzQ2YjEtNzFmNi00ZWQ1LThjNTQtODE2YWE0ZjhjNTAyOjEyM3pPM3haQ0xyTU42djJCS0sxZFhZRnBYbFBrY2NPRnFtMTJDZEFzTWdSVTRWck5aOWx5R1ZDR3VNREdJd1A=" \
	            -H "Content-Type:application/json" \
	            http://controller:8888/api/v1/namespaces/guest/actions/hello-perf?blocking=true

	$(WSK_CLI) -i action delete hello-perf
	rm hello.js

.PHONY: pull
pull: download setup
	docker-compose --project-name openwhisk pull

# Optional package configuration stages. These commands will install and set up
# the alarms, cloudant and kakfa packages.
PACKAGES = alarms cloudant kafka
PACKAGE_ALARMS_HOME ?= ./openwhisk-package-alarms
PACKAGE_CLOUDANT_HOME ?= ./openwhisk-package-cloudant
PACKAGE_KAFKA_HOME ?= ./openwhisk-package-kafka
CREATE_PACKAGE_STEPS = download-package- install-package- start-provider-

create-provider-alarms: check-alarm-ports setup-providers $(addsuffix alarms,$(CREATE_PACKAGE_STEPS))

create-provider-cloudant: check-cloudant-ports setup-providers $(addsuffix cloudant,$(CREATE_PACKAGE_STEPS))

create-provider-kafka: check-kafka-ports setup-providers $(addsuffix kafka,$(CREATE_PACKAGE_STEPS))

.PHONY: setup-providers
setup-providers:
	printf "OPENWHISK_HOME=$(realpath $(PROJECT_HOME))\n" > ~/tmp/openwhisk/providers.env
	printf "ENDPOINT_AUTH=`cat $(realpath $(PROJECT_HOME))/ansible/files/auth.whisk.system`\n" >> ~/tmp/openwhisk/providers.env
	printf "HOST_MACHINE=$(DOCKER_HOST_IP)\n" >> ~/tmp/openwhisk/providers.env
	printf "DOCKER_COMPOSE_HOST=$(DOCKER_HOST_IP)\n" >> ~/tmp/openwhisk/providers.env

.PHONY: $(addprefix download-package-,$(PACKAGES))
$(addprefix download-package-,$(PACKAGES)):
	$(eval PACKAGE_NAME:= $(shell echo $(@) | cut -b 18-))
	$(eval PACKAGE_HOME := $(PACKAGE_$(shell echo $(PACKAGE_NAME) |  tr 'a-z' 'A-Z')_HOME))
	echo "Downloading package" $(PACKAGE_NAME) "into" $(PACKAGE_HOME)
	rm -rf ./openwhisk-package-$(PACKAGE_NAME)*
	if [ "$(PACKAGE_HOME)" = "./openwhisk-package-$(PACKAGE_NAME)" ]; then \
	    curl -O ./openwhisk-package-$(PACKAGE_NAME).tar.gz -L https://api.github.com/repos/apache/incubator-openwhisk-package-$(PACKAGE_NAME)/tarball/master > ./openwhisk-package-$(PACKAGE_NAME).tar.gz; \
	    mkdir openwhisk-package-$(PACKAGE_NAME); \
	    tar -xf ./openwhisk-package-$(PACKAGE_NAME).tar.gz --strip 1 -C openwhisk-package-$(PACKAGE_NAME); \
	else \
	     echo "Skipping downloading the code from git as PACKAGE_HOME is not default:" $(PACKAGE_HOME); \
	fi

.PHONY: $(addprefix install-package-,$(PACKAGES))
$(addprefix install-package-,$(PACKAGES)):
	$(eval PACKAGE_NAME:= $(shell echo $(@) | cut -b 17-))
	$(eval PACKAGE_HOME := $(PACKAGE_$(shell echo $(PACKAGE_NAME) |  tr 'a-z' 'A-Z')_HOME))
	cd $(PACKAGE_HOME) && \
	$(shell cat ~/tmp/openwhisk/providers.env) ./installCatalog.sh $(realpath $(PROJECT_HOME))/ansible/files/auth.whisk.system $(DOCKER_HOST_IP) "http://$(DOCKER_HOST_IP):5984" $(OPEN_WHISK_DB_PREFIX) $(DOCKER_HOST_IP)

.PHONY: $(addprefix start-provider-,$(PACKAGES))
$(addprefix start-provider-,$(PACKAGES)):
	$(eval PACKAGE_NAME:= $(shell echo $(@) | cut -b 16-))
	$(shell cat ~/tmp/openwhisk/providers.env) docker-compose -f docker-compose.yml -f docker-compose.packages.yml --project-name openwhisk up --no-recreate $(PACKAGE_NAME)provider 2>&1 > ~/tmp/openwhisk/docker-provider-compose.log &

.PHONY: $(addprefix stop-provider-,$(PACKAGES))
$(addprefix stop-provider-,$(PACKAGES)): setup-providers
	$(eval PACKAGE_NAME:= $(shell echo $(@) | cut -b 15-))
	$(shell cat ~/tmp/openwhisk/providers.env) docker-compose -f docker-compose.yml -f docker-compose.packages.yml --project-name openwhisk stop $(PACKAGE_NAME)provider
