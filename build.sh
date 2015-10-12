#!/bin/bash
if [[ $1 == 'debug' ]]; then
	CMD=node-debug
else
	CMD=node
fi

# killall -SIGKILL node
$CMD ./tests/tests.js