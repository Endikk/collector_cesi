#!/bin/bash

# Simple Load Test Script for Collector Backend
# Usage: ./load-test.sh [url] [requests] [concurrency]

URL="${1:-http://localhost:4000/metrics}"
REQUESTS="${2:-1000}"
CONCURRENCY="${3:-10}"

echo "Starting load test on $URL"
echo "Requests: $REQUESTS | Concurrency: $CONCURRENCY"

if command -v ab &> /dev/null; then
    echo "Using Apache Bench..."
    ab -n "$REQUESTS" -c "$CONCURRENCY" "$URL"
else
    echo "Apache Bench (ab) not found. Using simple curl loop (sequential)..."
    start_time=$(date +%s)
    for ((i=1;i<=REQUESTS;i++)); do
        curl -s -o /dev/null -w "%{http_code}" "$URL"
    done
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo "Finished $REQUESTS requests in $duration seconds."
fi
