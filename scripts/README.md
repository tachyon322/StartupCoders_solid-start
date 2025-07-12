# Database Migration Scripts

This directory contains scripts for managing database migrations.

## Available Scripts

### 1. `run-migration.js`
Runs the migration to create all tables without dropping existing ones.
- Uses `DATABASE_URL` from `.env` file
- Will fail if tables already exist

### 2. `run-migration-simple.js`
Same as `run-migration.js` but with hardcoded database URL.
- Can use `DATABASE_URL` env variable or falls back to hardcoded value
- Useful for quick testing without setting up `.env`

### 3. `reset-and-migrate.js` ⚠️ **DESTRUCTIVE**
**WARNING: This will DROP ALL TABLES and recreate them from scratch!**
- Drops all existing tables in the correct order
- Then runs the full migration to recreate everything
- Uses `DATABASE_URL` from `.env` file
- Shows detailed progress and verification

### 4. `reset-and-migrate-simple.js` ⚠️ **DESTRUCTIVE**
Same as `reset-and-migrate.js` but with hardcoded database URL.
- Can use `DATABASE_URL` env variable or falls back to hardcoded value

## Usage

### Using npm scripts (recommended):
```bash
# Run migration (requires existing .env file)
npm run db:migrate

# Run migration with hardcoded connection
npm run db:migrate:simple

# Reset and migrate (DROPS ALL TABLES!) - requires .env
npm run db:reset

# Reset and migrate with hardcoded connection
npm run db:reset:simple
```

### Direct execution:
```bash
# Make sure you have the required dependencies
npm install

# Run directly with node
node scripts/run-migration.js
node scripts/reset-and-migrate.js
```

### With custom DATABASE_URL:
```bash
DATABASE_URL="postgresql://user:pass@host:port/db" node scripts/reset-and-migrate.js
```

## Database Schema

The migration creates the following tables:
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth/password accounts
- `verification` - Email verification tokens
- `tag` - Tags for categorization
- `startup_request` - Startup requests
- `startup` - Startup entities
- `images` - Startup images
- Junction tables for many-to-many relationships:
  - `tag_to_user`
  - `tag_to_startup`
  - `startup_participants`
  - `startup_request_users`
  - `startup_request_startups`

Plus indexes and triggers for performance and automatic timestamp updates.

## Safety Notes

1. **Always backup your database** before running reset scripts
2. The reset scripts use `CASCADE` to ensure all dependent objects are dropped
3. The scripts handle cases where tables might not exist (won't fail on first run)
4. Each SQL statement is executed separately for better error handling