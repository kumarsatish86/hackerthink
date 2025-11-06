import { createContactTables } from './create-contact-tables';

async function runContactMigration() {
  try {
    console.log('Starting contact module migration...');
    await createContactTables();
    console.log('Contact module migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running contact migration:', error);
    process.exit(1);
  }
}

// Run the migration
runContactMigration();
