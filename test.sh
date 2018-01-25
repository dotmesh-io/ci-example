#!/bin/sh

###
# 
# simple script to make some changes to an API and exit
#
###

if [ -z "$TEST_URL" ]; then
    echo "Must have env var TEST_URL set" >&2
    exit 1
fi

TEST_PATH=${TEST_URL%/}/v1/whales

# we need to wait until it is up - give it as long as set or maximum 20 seconds
WAIT_TIME=${WAIT_TIME:-20}
count=0

until $(curl --output /dev/null --silent --fail $TEST_PATH); do
    count=$(( $count + 1 ))
    if [ $count -gt $WAIT_TIME ]; then
        echo "service at $TEST_PATH not ready in $WAIT_TIME seconds. Exiting." >&2
        exit 1
    fi
    sleep 1
done

curl -X POST --data "25:40" $TEST_PATH
curl -X POST --data "30:66" $TEST_PATH
curl -X POST --data "88:77" $TEST_PATH
curl -X POST --data "76:88" $TEST_PATH
curl -X POST --data "1234:99" $TEST_PATH

[ -n "$FAIL" ] && exit 1



