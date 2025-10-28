/**
 * This script patches the pg-cloudflare module in node_modules to prevent
 * it from trying to use cloudflare:sockets, which causes build errors.
 */

const fs = require('fs');
const path = require('path');

// Find the pg-cloudflare module
const pgCloudflareDir = path.resolve(__dirname, '../../../node_modules/pg-cloudflare');
const pgCloudflareFile = path.join(pgCloudflareDir, 'index.js');

// Check if it exists
if (!fs.existsSync(pgCloudflareFile)) {
  console.log('pg-cloudflare module not found, skipping patch');
  process.exit(0);
}

// Read the original file
const originalCode = fs.readFileSync(pgCloudflareFile, 'utf8');

// Create a backup
fs.writeFileSync(`${pgCloudflareFile}.backup`, originalCode);

// Replace the problematic code
const patchedCode = `
// This file has been patched to prevent errors with cloudflare:sockets
module.exports.isCloudflare = function() {
  return false;
};

module.exports.connect = function() {
  return null;
};
`;

// Write the patched file
fs.writeFileSync(pgCloudflareFile, patchedCode);

console.log('Successfully patched pg-cloudflare to prevent cloudflare:sockets errors'); 