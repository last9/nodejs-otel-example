# Nodejs OTEL Instrumentation - Serverless

## Overview

This Node.js application demonstrates the integration of OpenTelemetry for collecting and exporting metrics,
specifically focusing on HTTP request metrics. It includes the creation of a custom geometric sequence for latency
bucketing, counters for request counts, and histograms for request latencies. The application also simulates Cloudflare
Worker fetch event triggers.

You can checkout these links to know

- [How to setup vmagent](https://docs.last9.io/docs/levitate-integrations-vmagent)
- [How to setup your Levitate cluster](https://docs.last9.io/docs/levitate-onboard)

[![architecture](https://mermaid.ink/img/pako:eNptkcluAyEMhl8F-Zz2AThEapXeukidnCou1uBMiYalYFJFUd69ziz00HIAbD7_xvYF-mgJNBT6qhR62jkcMnoTlKyEmV3vEgZWr8Idy0NKCosycDPvj0WJw8Bf-uRxIDkndjH-457p5BiZZrBZ-273uOIt8d12uyhp1VGwyiKjqsWFQb0lCnsayRPn8xy3sBK1ymr1Tj6K_Hd2snNs6U2ADXjKHp2VZlxuCgb4U_QMaLlaOmAdpxKugmLl2J1DD5pzpQ3UJH9Zewf6gGNp3ifrOObmlLI_YvyFaHp-macwDeP6A9khjCg?type=png)](https://mermaid.live/edit#pako:eNptkcluAyEMhl8F-Zz2AThEapXeukidnCou1uBMiYalYFJFUd69ziz00HIAbD7_xvYF-mgJNBT6qhR62jkcMnoTlKyEmV3vEgZWr8Idy0NKCosycDPvj0WJw8Bf-uRxIDkndjH-457p5BiZZrBZ-273uOIt8d12uyhp1VGwyiKjqsWFQb0lCnsayRPn8xy3sBK1ymr1Tj6K_Hd2snNs6U2ADXjKHp2VZlxuCgb4U_QMaLlaOmAdpxKugmLl2J1DD5pzpQ3UJH9Zewf6gGNp3ifrOObmlLI_YvyFaHp-macwDeP6A9khjCg)

## Prerequisites

- You need a vmagent running that the underlying OTEL Exporter can write to.
- Node.js environment
- Relevant environment variables set (METRIC_PREFIX, OTLP_ENDPOINT, SERVICE_NAME, OTLP_METRIC_EXPORTER_FREQUENCY,
OTLP_METER_NAME, ENVIRONMENT)

## Features

- **OpenTelemetry Metrics Integration**: Utilizes OpenTelemetry's metrics collection and OTLP (OpenTelemetry Protocol)
  exporter for metric data.
- **Custom Latency Buckets**: Generates latency buckets using a geometric sequence for detailed latency analysis.
- **Metric Collection for HTTP Requests**: Collects metrics for HTTP request counts and latencies.
- **Event-Driven Simulation**: Simulates Cloudflare Worker fetch events for testing and development purposes.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the application's directory.
3. Install the required dependencies:

```bash
npm install @opentelemetry/api@^1.3.0 \
            @opentelemetry/core@1.19.0 \
            @opentelemetry/exporter-metrics-otlp-proto@0.46.0 \
            @opentelemetry/resources@1.19.0 \
            @opentelemetry/sdk-metrics@1.19.0 \
            @opentelemetry/semantic-conventions@1.19.0 \
            uuid@^9.0.1 \
            && npm install
```

## Usage

Run the application using Node:

```bash
$ node app.js
```

## Environment Variables
Ensure these environment variables are set:

### `OTLP_ENDPOINT`

- **Description**: The endpoint for OpenTelemetry Protocol (OTLP) for exporting telemetry data.
- **Type**: String
- **Example Value**: `http://localhost:8429/opentelemetry/api/v1/push`

### `SERVICE_NAME`

- **Description**: The name of the service or application.
- **Type**: String
- **Example Value**: `workflow-job`

### `OTLP_METRIC_EXPORTER_FREQUENCY`

- **Description**: The frequency (in milliseconds) for exporting OpenTelemetry metrics.
- **Type**: Integer
- **Default Value**: 15000 (15 seconds)

### `OTLP_METER_NAME`

- **Description**: The name of the OpenTelemetry meter.
- **Type**: String
- **Example Value**: `workflow-job-meter`

### `ENVIRONMENT`

- **Description**: The environment in which the application is running (e.g., "production," "development").
- **Type**: String
- **Example Value**: `production`

### `METRIC_PREFIX`

- **Description**: A prefix name to add to the metrics exported.
- **Type**: String
- **Example Value**: `my_app`

## Notes

- This application is a simulation and primarily for demonstration and development purposes.
- Adjust the parameters like export frequency and geometric sequence as per your requirements.
- Ensure that your OTLP endpoint is correctly configured to receive and process the exported metrics.


These environment variables are used to configure various aspects of our application. Please ensure that they are
correctly set according to the requirements of your environment. You can set them in your deployment scripts,
environment configuration, or directly in your shell environment.

## Default Values

Some of the variables have default values provided. These defaults are used if the corresponding environment variables
are not explicitly set. You can override the defaults as needed for your specific deployment.

This will start the application and begin exporting metrics at a 15-second interval.

**Note**

_In this example, we've demonstrated the initialization of a single meter with a fixed export frequency of 15 seconds.
Within this meter, four separate gauges have been defined. If you find the need for variable export frequencies, you
will need to specify and configure additional meters accordingly._

## Configuration

- The application exports metrics to an OTLP compatible vmagent
  endpoint `http://localhost:8429/opentelemetry/api/v1/push`.
  Update this to point to your collector endpoint.
- The default export interval is set to 15 seconds. This can be adjusted in the `PeriodicExportingMetricReader`
  configuration.
- The application generates a set number of workflow and customer IDs, which can be modified as needed.

## Counters and Histos

- **Request Count**: Captured everytime a request is received.
- **Request Duration**: Captured everytime a request is processed.

---

## Docker and Docker Compose Setup

This application is configured to be run in a Docker container, making the setup and deployment process consistent and
isolated across different environments.

### Building with Docker

1. **Build the Docker Image**:
   Navigate to the directory containing the Dockerfile and run:
   ```bash
   docker build -t your-app-name .
   ```
   Replace `your-app-name` with the desired name for your Docker image.

2. **Run the Docker Container**:
   After building the image, start your application by running:
   ```bash
   docker run -p 3000:3000 your-app-name
   ```

### Using Docker Compose

The application can also be run using Docker Compose, which simplifies the process of configuring and launching the
container, especially when dealing with environment variables and port mappings.

1. **Start the Application**:
   Use Docker Compose to build and start the application:
   ```bash
   docker-compose up --build
   ```

2. **Stop the Application**:
   To stop and remove the containers, networks, and volumes created by `up`, use:
   ```bash
   docker-compose down
   ```

### Configuration

- The `docker-compose.yaml` file contains environment variables that are crucial for the application's execution. These
  variables are set as per the application's requirements and should be modified if necessary.
- Ensure the OTLP endpoint (`OTLP_ENDPOINT`) is correctly set to point to your vmagent endpoint.

---

## Note

This application is for demonstration purposes and may require adjustments for production use. Ensure the vmagent can
handle the volume of data generated.
