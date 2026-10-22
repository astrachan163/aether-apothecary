const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { checkCatalogMappings } = require('../functions/stripe-config');

try {
  const root = join(__dirname, '..');
  const allowlist = JSON.parse(readFileSync(join(root, 'functions/stripe-price-allowlist.json'), 'utf8'));
  const catalogIndex = process.argv.indexOf('--catalog');
  const catalogPath = catalogIndex < 0 ? join(root, 'functions/seed/products.json') : process.argv[catalogIndex + 1];
  if (!catalogPath) throw new Error('Supply a catalog JSON path after --catalog.');
  const result = checkCatalogMappings(allowlist, JSON.parse(readFileSync(catalogPath, 'utf8')));
  console.log(result.enabled ? `Stripe mappings: ${result.mappedProducts} available products validated; remote test-price verification still required.` : 'Stripe configuration: checkout off (empty allowlist).');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
