# Demo App

This is a sample application used to demonstrate the envoy mesh.

![Architecture](./mesh.png)

## Run

```bash
docker-compose up
```

## Test

```bash
http get localhost:8080/product-list
```

## Request Tracing

Open [Zipkin](http://localhost:9411), select `front` service and click `Find Traces`. You will see a request with 3 spans.