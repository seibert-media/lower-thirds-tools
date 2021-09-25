#!/usr/bin/env bash
cd "$(dirname "$(readlink -f "$0")")"

PORT=${SERVER_PORT:=8080}
HOST=${SERVER_HOST:=}

exec uwsgi --http "${HOST}:${PORT}" --gevent 1000 --http-websockets --master --wsgi-file server.py --callable app --static-map /static=./static
