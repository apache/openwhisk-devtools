#!/bin/bash

set -ex

INVOKER_INDEX=$(hostname | cut -d'-' -f2)

export COMPONENT_NAME=invoker${INVOKER_INDEX}

exec /invoker/bin/invoker $INVOKER_INDEX
