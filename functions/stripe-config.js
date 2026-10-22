function validatePriceAllowlist(value) {
  if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !/^price_[A-Za-z0-9_]+$/.test(id))) {
    throw new Error('Invalid Stripe test-price allowlist.');
  }
  const ids = new Set(value);
  if (ids.size !== value.length) throw new Error('Duplicate Stripe test-price IDs.');
  return ids;
}

function assertMatchingTestPrice(price, id, amount) {
  const cents = Math.round(amount * 100);
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0
    || Math.abs(amount * 100 - cents) > 0.000001
    || !price || price.id !== id || price.livemode !== false || price.active !== true
    || price.currency !== 'usd' || price.type !== 'one_time' || price.unit_amount !== cents) {
    throw new Error('The mapped Stripe test price does not match the catalog.');
  }
  return id;
}

function checkCatalogMappings(allowlist, products) {
  const ids = validatePriceAllowlist(allowlist);
  if (ids.size === 0) return { enabled: false, mappedProducts: 0 };
  if (!Array.isArray(products)) throw new Error('A catalog export is required.');
  const available = products.filter(product => product.published === true && product.active === true && product.inventory > 0);
  if (available.length === 0) throw new Error('No available published catalog products were supplied.');
  for (const product of available) {
    if (!ids.has(product.stripePriceId) || typeof product.price !== 'number' || !Number.isFinite(product.price)
      || product.price < 0 || Math.abs(product.price * 100 - Math.round(product.price * 100)) > 0.000001) {
      throw new Error('An available product has no valid configured server price mapping.');
    }
  }
  return { enabled: true, mappedProducts: available.length };
}

module.exports = { validatePriceAllowlist, assertMatchingTestPrice, checkCatalogMappings };
