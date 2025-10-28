console.log('Hello from Node.js!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Test if we can require modules
try {
  const path = require('path');
  console.log('✅ Path module loaded successfully');
  console.log('Script location:', __filename);
} catch (err) {
  console.error('❌ Failed to load path module:', err.message);
}

// Test if we can require pg
try {
  const { Pool } = require('pg');
  console.log('✅ PG module loaded successfully');
} catch (err) {
  console.error('❌ Failed to load PG module:', err.message);
}

console.log('Script completed successfully!');
