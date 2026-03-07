#!/usr/bin/env node

const { execSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;

// Only run migration if DATABASE_URL is set and is PostgreSQL
if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  console.log('Running Prisma migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('Skipping migration: DATABASE_URL not set or not PostgreSQL');
  console.log('DATABASE_URL:', databaseUrl ? 'set (but not PostgreSQL)' : 'not set');
}
