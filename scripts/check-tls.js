// Verifies the Node runtime's TLS trust policy for issue #8: a chain through a
// compromised eMudhra intermediate must be rejected as revoked, while a normal trusted
// endpoint must still connect. Exits non-zero if either expectation fails.
// Run inside the built image: `docker run --rm <image> node scripts/check-tls.js`.
const https = require('https');

const BLOCKED_URL = 'https://dv-g3b-emudhra.we-have-a-problem.com/';
const TRUSTED_URL = 'https://nodejs.org/';
const TIMEOUT_MS = 15000;

function probe(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: TIMEOUT_MS }, (res) => {
      res.resume();
      resolve({ ok: true, status: res.statusCode });
    });
    req.on('timeout', () => req.destroy(new Error(`timed out after ${TIMEOUT_MS}ms`)));
    req.on('error', (err) => resolve({ ok: false, code: err.code, message: err.message }));
  });
}

// The upstream SPKI blocklist (nodejs/node@d9a3f3d) reports CERT_REVOKED.
// Accept only that code: DNS failures, timeouts or an unrelated chain error
// would otherwise pass without proving the blocklist is present.
const BLOCKLIST_ERROR_CODE = 'CERT_REVOKED';

async function main() {
  console.log(`process.version=${process.version}`);
  console.log(`openssl=${process.versions.openssl}`);

  const blocked = await probe(BLOCKED_URL);
  console.log(`${BLOCKED_URL} -> ${JSON.stringify(blocked)}`);
  const trusted = await probe(TRUSTED_URL);
  console.log(`${TRUSTED_URL} -> ${JSON.stringify(trusted)}`);

  const failures = [];
  if (blocked.code !== BLOCKLIST_ERROR_CODE) {
    failures.push(`expected ${BLOCKLIST_ERROR_CODE} from ${BLOCKED_URL}`);
  }
  if (!trusted.ok) {
    failures.push(`expected ${TRUSTED_URL} to connect`);
  }
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  if (failures.length) process.exit(1);
  console.log('PASS: compromised chain rejected, trusted endpoint accepted');
}

main();
