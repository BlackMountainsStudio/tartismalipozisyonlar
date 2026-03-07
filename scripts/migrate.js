#!/usr/bin/env node

const { execSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  console.log('Running Prisma migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.warn('Migration deploy failed, trying prisma db push...');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('Database push completed successfully');
    } catch (pushError) {
      console.warn('Database push also failed, skipping:', pushError.message);
    }
  }
} else {
  console.log('Skipping migration: DATABASE_URL not set or not PostgreSQL');
}
