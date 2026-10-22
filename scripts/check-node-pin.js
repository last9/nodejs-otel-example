// Keeps the Node runtime pin in one version across its surfaces (issue #8): the
// Dockerfile base image must be an exact `node:<x.y.z>@sha256:<digest>` and
// `engines.node` must floor at that same release (`^x.y.z`), the first one
// carrying the eMudhra blocklist. With `--runtime`, also asserts the running Node
// is that release, which proves the built image ships what the Dockerfile names.
// Exits non-zero on any mismatch.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FROM_PATTERN = /^FROM node:(\d+\.\d+\.\d+)@sha256:[0-9a-f]{64}$/m;
const ENGINES_PATTERN = /^\^(\d+\.\d+\.\d+)$/;

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function main() {
  const failures = [];

  const from = read('Dockerfile').match(FROM_PATTERN);
  const imageVersion = from && from[1];
  if (!imageVersion) failures.push('Dockerfile must use FROM node:<x.y.z>@sha256:<digest>');

  const engines = (JSON.parse(read('package.json')).engines || {}).node || '';
  const enginesFloor = (engines.match(ENGINES_PATTERN) || [])[1];
  if (!enginesFloor) failures.push(`engines.node must be ^<x.y.z>, got "${engines}"`);

  if (imageVersion && enginesFloor && imageVersion !== enginesFloor) {
    failures.push(`Dockerfile pins node ${imageVersion} but engines.node floors at ${enginesFloor}`);
  }
  if (process.argv.includes('--runtime') && imageVersion && process.version !== `v${imageVersion}`) {
    failures.push(`running ${process.version}, expected v${imageVersion}`);
  }

  for (const failure of failures) console.error(`FAIL: ${failure}`);
  if (failures.length) process.exit(1);
  console.log(`PASS: node ${imageVersion} pinned in Dockerfile and engines.node`);
}

main();
