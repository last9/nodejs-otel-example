'use strict';

const {DiagConsoleLogger, DiagLogLevel, ValueType, diag} = require('@opentelemetry/api');
const {OTLPMetricExporter} = require('@opentelemetry/exporter-metrics-otlp-proto');

const {
  ExponentialHistogramAggregation, MeterProvider, PeriodicExportingMetricReader, View,
} = require('@opentelemetry/sdk-metrics');
const {Resource} = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const os = require('os');
const {v4: uuidv4} = require('uuid');

// Global variables
// Toggle this number below to explode cardinality.
const workflow_ids = Array.from({length: 100}, () => uuidv4());
const customer_ids = Array.from({length: 40}, () => uuidv4());


// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:8429/opentelemetry/api/v1/push'
});

// Create an instance of the metric provider
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'basic-metric-service',
  })
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: metricExporter, // exporter: new ConsoleMetricExporter(),
  exportIntervalMillis: 15000,
}));

const meter = meterProvider.getMeter('example-exporter-collector');

// Create Observable Gauges
const memoryUsageGauge = meter.createObservableGauge('memory_usage', {
  description: 'Tracks the memory usage of the application', valueType: ValueType.DOUBLE
});

const concurrencyGauge = meter.createObservableGauge('concurrency', {
  description: 'Current concurrency level', valueType: ValueType.INT
});

const cpuUsageGauge = meter.createObservableGauge('cpu_usage', {
  description: 'CPU usage percentage', valueType: ValueType.DOUBLE
});

const runInTimeGauge = meter.createObservableGauge('run_in_time', {
  description: 'Run time in seconds', valueType: ValueType.INT
});

// Base Label Sets
const attributes = {pid: process.pid, environment: 'staging'};

// Callbacks for Observable Gauges
concurrencyGauge.addCallback((observableResult) => {
  workflow_ids.forEach(workflow_id => {
    customer_ids.forEach(customer_id => {
      let concurrency = Math.floor(Math.random() * 10) + 1;
      observableResult.observe(concurrency, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id
      });
    });
  });
});

cpuUsageGauge.addCallback((observableResult) => {
  workflow_ids.forEach(workflow_id => {
    customer_ids.forEach(customer_id => {
      const cpuUsage = os.loadavg()[0]; // Load average for 1 minute; adjust as needed
      observableResult.observe(cpuUsage, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id
      });
    });
  });
});

runInTimeGauge.addCallback((observableResult) => {
  workflow_ids.forEach(workflow_id => {
    customer_ids.forEach(customer_id => {
      let run_in_time = Math.floor(Math.random() * 60);
      observableResult.observe(run_in_time, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id
      });
    });
  });
});

memoryUsageGauge.addCallback((observableResult) => {
  workflow_ids.forEach(workflow_id => {
    customer_ids.forEach(customer_id => {
      const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024; // Convert bytes to megabytes
      observableResult.observe(usedMemory, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id, 'unit': 'MB'
      });
    });
  });
});


// Periodically update global variables if needed
setInterval(() => {
  console.log("Job Executed")
}, 15000); // Adjust as needed