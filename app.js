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
const metricPrefix = process.env.METRIC_PREFIX
const workflowIDCount = parseInt(process.env.WORKFLOW_ID_COUNT);
const customerIDCount = parseInt(process.env.CUSTOMER_ID_COUNT);
const otlpEndpoint = process.env.OTLP_ENDPOINT;
const serviceName = process.env.SERVICE_NAME;
const otelMetricExporterFrequency = parseInt(process.env.OTLP_METRIC_EXPORTER_FREQUENCY);
const otelMeterName = process.env.OTLP_METER_NAME;
const environment = process.env.ENVIRONMENT;

// Global variables
// Toggle this number below to explode cardinality.
const workflowIDs = Array.from({length: workflowIDCount}, () => uuidv4());
const customerIDs = Array.from({length: customerIDCount}, () => uuidv4());


// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const metricExporter = new OTLPMetricExporter({
  url: otlpEndpoint
});

// Create an instance of the metric provider
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  })
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: metricExporter, // exporter: new ConsoleMetricExporter(),
  exportIntervalMillis: otelMetricExporterFrequency,
}));

const meter = meterProvider.getMeter(otelMeterName);

// Create Observable Gauges
const memoryUsageGauge = meter.createObservableGauge(`${metricPrefix}_memory_usage`, {
  description: 'Tracks the memory usage of the application', valueType: ValueType.DOUBLE
});

const concurrencyGauge = meter.createObservableGauge(`${metricPrefix}_concurrency`, {
  description: 'Current concurrency level', valueType: ValueType.INT
});

const cpuUsageGauge = meter.createObservableGauge(`${metricPrefix}_cpu_usage`, {
  description: 'CPU usage percentage', valueType: ValueType.DOUBLE
});

const runInTimeGauge = meter.createObservableGauge(`${metricPrefix}_run_time`, {
  description: 'Run time in seconds', valueType: ValueType.INT
});

// Base Label Sets
const attributes = {pid: process.pid, environment: environment};

// Callbacks for Observable Gauges
concurrencyGauge.addCallback((observableResult) => {
  for (let i = 0; i < workflowIDs.length; i++) {
    const workflow_id = workflowIDs[i];
    for (let j = 0; j < customerIDs.length; j++) {
      const customer_id = customerIDs[j];
      let concurrency = Math.floor(Math.random() * 10) + 1;
      observableResult.observe(concurrency, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id
      });
    }
  }
});

cpuUsageGauge.addCallback((observableResult) => {
  for (let i = 0; i < workflowIDs.length; i++) {
    const workflow_id = workflowIDs[i];
    for (let j = 0; j < customerIDs.length; j++) {
      const customer_id = customerIDs[j];
      let cpuUsage = os.loadavg()[0]; // Load average for 1 minute; adjust as needed
      observableResult.observe(cpuUsage, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id
      });
    }
  }
});


runInTimeGauge.addCallback((observableResult) => {
  for (let i = 0; i < workflowIDs.length; i++) {
    const workflow_id = workflowIDs[i];
    for (let j = 0; j < customerIDs.length; j++) {
      const customer_id = customerIDs[j];
      let run_time = Math.floor(Math.random() * 60);
      observableResult.observe(run_time, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id
      });
    }
  }
});

memoryUsageGauge.addCallback((observableResult) => {
  for (let i = 0; i < workflowIDs.length; i++) {
    const workflow_id = workflowIDs[i];
    for (let j = 0; j < customerIDs.length; j++) {
      const customer_id = customerIDs[j];
      let usedMemory = process.memoryUsage().heapUsed / 1024 / 1024; // Convert bytes to megabytes
      observableResult.observe(usedMemory, {
        ...attributes, 'workflow_id': workflow_id, 'customer_id': customer_id, 'unit': 'MB'
      });
    }
  }
});


// Periodically update global variables if needed
setInterval(() => {
  console.log("Job Executed")
}, 15000); // Adjust as needed