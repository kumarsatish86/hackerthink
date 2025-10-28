#!/bin/bash

# Production build script for LinuxConcept
# This script ensures clean builds without database operations

set -e  # Exit on any error

echo "🚀 Starting production build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set production environment
export NODE_ENV=production

# Build the application
echo "🔨 Building Next.js application..."
npm run build

# Check build output for database operations
echo "🔍 Checking build output for database operations..."

if grep -q "Database connection established successfully" .next/build-manifest.json 2>/dev/null; then
    echo "❌ Warning: Database operations detected in build output"
else
    echo "✅ No database operations detected in build"
fi

if grep -q "Starting migrations for commands" .next/build-manifest.json 2>/dev/null; then
    echo "❌ Warning: Migration operations detected in build output"
else
    echo "✅ No migration operations detected in build"
fi

echo ""
echo "🎉 Production build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Setup database (if not already done): npm run db:setup:prod"
echo "2. Start production server: npm start"
echo "3. Or use PM2: pm2 start ecosystem.config.js --env production"
echo ""
echo "📁 Build output: .next/"
echo "📁 Static files: .next/standalone/ (if using standalone output)"
