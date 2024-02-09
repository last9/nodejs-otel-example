'use strict';

const {ValueType} = require('@opentelemetry/api');
const {OTLPMetricExporter} = require('@opentelemetry/exporter-metrics-otlp-proto');

const {
  ExponentialHistogramAggregation, MeterProvider, PeriodicExportingMetricReader, View,
  ExplicitBucketHistogramAggregation, InstrumentType,
} = require('@opentelemetry/sdk-metrics');
const {Resource} = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const {v4: uuidv4} = require('uuid');
const metricPrefix = process.env.METRIC_PREFIX || 'default';
const otlpEndpoint = process.env.OTLP_ENDPOINT;
const serviceName = process.env.SERVICE_NAME;
const otelMetricExporterFrequency = parseInt(process.env.OTLP_METRIC_EXPORTER_FREQUENCY);
const otelMeterName = process.env.OTLP_METER_NAME;
const environment = process.env.ENVIRONMENT;

// These are purely to simulate event based system and nothing to do with OTEL Instrumentation
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

const metricExporter = new OTLPMetricExporter({
  url: otlpEndpoint
});

// Geometric Sequence to generate a latency bucket
function geometricSequence(start, step, limit) {
  let sequence = [];
  let current = start;

  for (let i = 0; i < limit; i++) {
    sequence.push(parseFloat(current.toFixed(2)));
    current *= step;
  }

  return sequence;
}

const latencyBuckets = geometricSequence(0.25, 1.5, 31)

const histogramView = new View({
  aggregation: new ExplicitBucketHistogramAggregation(latencyBuckets),
  instrumentName: `${metricPrefix}_http_requests_milliseconds`,
  instrumentType: InstrumentType.HISTOGRAM,
});

// Create an instance of the metric provider
const meterProvider = new MeterProvider({
  views: [histogramView],
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  })
});

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
  exporter: metricExporter, // exporter: new ConsoleMetricExporter(),
  exportIntervalMillis: otelMetricExporterFrequency,
}));

const meter = meterProvider.getMeter(otelMeterName);

// Base Label Sets
const attributes = {pid: process.pid, environment: environment};


// Create RequestCount Counters
const requestCountCounter = meter.createCounter(
    `${metricPrefix}_request_count`, {
      description: 'Request Count', valueType: ValueType.INT
    });

const requestHisto = meter.createHistogram(
    `${metricPrefix}_http_requests_milliseconds`, {
      description: 'Request Latency', valueType: ValueType.DOUBLE, unit: 'ms'
    }
)

// Event listner similar to cloudflare worker
myEmitter.on('fetch', event => {
  handleRequest({path: '/order', domain: 'acme.com', method: 'POST'})
})

function handleRequest(request) {
  const startTime = new Date().getTime();
  // Add your handler logic here

  // End your handler logic here
  requestCountCounter.add(1, {
    ...attributes,
    path: request.path,
    domain: request.domain,
    method: request.method,
    status: "200"
  })
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  requestHisto.record(executionTime, {
    ...attributes,
    path: request.path,
    domain: request.domain,
    method: request.method,
    status: "200"
  })
  return new Response({status: 200})
}


// Periodically update global variables if needed
setInterval(() => {
  // Emitting customer fetch event to simulate Cloudflare worker trigger flow
  myEmitter.emit('fetch')
  console.log("Request Event Emitter")
}, 15000); // Adjust as needed