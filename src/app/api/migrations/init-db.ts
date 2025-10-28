// Import the shared db schema (using require since TypeScript may have issues with the JS module)
// @ts-ignore
const { initializeDatabase } = require('./db-schema');

// Export the function for use in API routes
export const initDatabase = initializeDatabase;

// When run directly, execute the initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
} 
