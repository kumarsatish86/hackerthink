# Scripts Directory

This directory contains utility scripts for the HackerThink project.

## Current Scripts

### New Tools
- `add-ai-prompt-generator-tool.js` - Adds the AI Prompt Generator tool to the database

### Build & Production
- `build-production.sh` - Production build script

### Database Utilities
- `cleanup-media-database.js` - Cleans up media database
- `test-db-connection.js` - Tests database connection

### Database Schemas
- `create-news-tables.sql` - Creates news tables schema
- `create-products-table-simple.sql` - Simple products table schema
- `create-products-table.sql` - Full products table schema
- `create-roadmaps-table.js` - Creates roadmaps table
- `create-web-stories-table.sql` - Creates web stories table

### Setup
- `setup-news-database.js` - Sets up news database

## Usage

To add a new tool to the database, run:
```bash
node scripts/add-ai-prompt-generator-tool.js
```

To test database connection:
```bash
node scripts/test-db-connection.js
```

