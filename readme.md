# Nodejs OTEL Instrumentation

This is an example instrumentation of a node js app using opentelemetry which uses the OTEL Exporter to push metrics to a OTLP Endpoint which in this case is a vmagent which writes to Levitate.

You can checkout these links to know 
- [How to setup vmagent](https://docs.last9.io/docs/levitate-integrations-vmagent)
- [How to setup your Levitate cluster](https://docs.last9.io/docs/levitate-onboard)

## Prerequisites
You need a vmagent running that the OTEL Exporter can write to.

## Usage
Clone Repo and run the following commands
```bash
$ npm install
$ node app.js
```
