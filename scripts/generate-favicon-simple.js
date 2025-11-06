const fs = require('fs');
const path = require('path');

// Create a simple SVG favicon with "HT" text
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#DC2626" rx="4"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">HT</text>
</svg>`;

// Save to public directory
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const svgPath = path.join(publicDir, 'favicon.svg');
fs.writeFileSync(svgPath, svgContent);

// Also create an app/icon.tsx route that serves this
const iconRoutePath = path.join(__dirname, '..', 'src', 'app', 'icon', 'route.tsx');
const iconRouteDir = path.dirname(iconRoutePath);
if (!fs.existsSync(iconRouteDir)) {
  fs.mkdirSync(iconRouteDir, { recursive: true });
}

const iconRouteContent = `import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving favicon:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
`;

fs.writeFileSync(iconRoutePath, iconRouteContent);

console.log('✓ Favicon SVG generated successfully!');
console.log(`  - SVG: ${svgPath}`);
console.log(`  - Icon route: ${iconRoutePath}`);

