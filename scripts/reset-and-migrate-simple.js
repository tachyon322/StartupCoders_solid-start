import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resetAndMigrate() {
  // Hardcoded DATABASE_URL - replace with your actual connection string
  // or pass it as an environment variable when running the script
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://denis:123123@83.220.169.202:5432/test';

  // Create a new client
  const client = new pg.Client({
    connectionString: databaseUrl,
  });

  try {
    // Connect to the database
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    // Drop all tables in the correct order (reverse of creation order)
    console.log('\n=== DROPPING EXISTING TABLES ===');
    
    const dropStatements = [
      // Drop triggers first
      'DROP TRIGGER IF EXISTS update_startup_updated_at ON "startup"',
      'DROP TRIGGER IF EXISTS update_startup_request_updated_at ON "startup_request"',
      
      // Drop function
      'DROP FUNCTION IF EXISTS update_updated_at_column()',
      
      // Drop junction tables first (they have foreign keys to other tables)
      'DROP TABLE IF EXISTS "startup_request_startups" CASCADE',
      'DROP TABLE IF EXISTS "startup_request_users" CASCADE',
      'DROP TABLE IF EXISTS "startup_participants" CASCADE',
      'DROP TABLE IF EXISTS "tag_to_startup" CASCADE',
      'DROP TABLE IF EXISTS "tag_to_user" CASCADE',
      
      // Drop tables with foreign keys
      'DROP TABLE IF EXISTS "images" CASCADE',
      'DROP TABLE IF EXISTS "startup" CASCADE',
      'DROP TABLE IF EXISTS "startup_request" CASCADE',
      'DROP TABLE IF EXISTS "tag" CASCADE',
      'DROP TABLE IF EXISTS "verification" CASCADE',
      'DROP TABLE IF EXISTS "account" CASCADE',
      'DROP TABLE IF EXISTS "session" CASCADE',
      
      // Drop the main user table last
      'DROP TABLE IF EXISTS "user" CASCADE'
    ];

    for (const dropStatement of dropStatements) {
      try {
        console.log(`Executing: ${dropStatement}`);
        await client.query(dropStatement);
      } catch (error) {
        // It's okay if some tables don't exist
        console.log(`  Warning: ${error.message}`);
      }
    }

    console.log('\nAll tables dropped successfully!');

    // Read the SQL file
    console.log('\n=== RUNNING MIGRATION ===');
    const sqlFilePath = join(__dirname, '..', 'better-auth_migrations', '2025-07-11T09-35-35.955Z.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    const sqlContent = readFileSync(sqlFilePath, 'utf8');

    // Parse SQL statements properly, handling dollar-quoted strings
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarQuoteTag = '';
    
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      currentStatement += line + '\n';
      
      // Check for dollar quote start/end
      const dollarQuoteMatch = line.match(/\$([^$]*)\$/g);
      if (dollarQuoteMatch) {
        for (const match of dollarQuoteMatch) {
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarQuoteTag = match;
          } else if (match === dollarQuoteTag) {
            inDollarQuote = false;
            dollarQuoteTag = '';
          }
        }
      }
      
      // If we're not in a dollar quote and line ends with semicolon, it's end of statement
      if (!inDollarQuote && line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    // Execute each statement
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await client.query(statement);
      } catch (error) {
        console.error(`Error in statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
        throw error;
      }
    }
    
    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the migration
console.log('=== RESET AND MIGRATE DATABASE ===');
console.log('This will DROP ALL EXISTING TABLES and recreate them from scratch.');
console.log('Make sure you have backed up any important data!\n');

resetAndMigrate();