# Nodejs OTEL Instrumentation

## Overview

This Node.js application demonstrates the usage of OpenTelemetry to create and export metrics as observable gauges. It
includes metrics for memory usage, concurrency, CPU usage, and run time, each associated with unique workflow and
customer IDs. The OTEL Exporter is used to push metrics to a OTLP Endpoint which in this case is a vmagent which writes
to Levitate.

You can checkout these links to know

- [How to setup vmagent](https://docs.last9.io/docs/levitate-integrations-vmagent)
- [How to setup your Levitate cluster](https://docs.last9.io/docs/levitate-onboard)

## Prerequisites

You need a vmagent running that the OTEL Exporter can write to.

## Features

- **Memory Usage Gauge**: Tracks the application's memory usage in megabytes.
- **Concurrency Gauge**: Monitors arbitrary concurrency levels within the application.
- **CPU Usage Gauge**: Measures CPU usage as a percentage.
- **Run Time Gauge**: Observes the run time in seconds.
- **Workflow and Customer ID Attributes**: Each metric includes attributes for workflow and customer IDs.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the application's directory.
3. Install the required dependencies:

```bash
npm install
````

## Usage

Run the application using Node:

```bash
$ node app.js
```

This will start the application and begin exporting metrics at a 15-second interval.

## Configuration

- The application exports metrics to an OTLP collector endpoint `http://localhost:8429/opentelemetry/api/v1/push`.
  Update this to point to your collector endpoint.
- The default export interval is set to 15 seconds. This can be adjusted in the `PeriodicExportingMetricReader`
  configuration.
- The application generates a set number of workflow and customer IDs, which can be modified as needed.

## Observable Gauges

- **Memory Usage**: Captured using Node.js `process.memoryUsage()`.
- **Concurrency**: A random value between 1 and 10.
- **CPU Usage**: Obtained from `os.loadavg()`.
- **Run Time**: A random value between 0 and 60 seconds.

Each gauge is associated with unique `workflow_id` and `customer_id` attributes.

## Note

This application is for demonstration purposes and may require adjustments for production use. Ensure the OpenTelemetry
collector i.e vmagent can handle the volume of data generated.
