import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  // Parse DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Create a new client
  const client = new pg.Client({
    connectionString: databaseUrl,
  });

  try {
    // Connect to the database
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    // Read the SQL file
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
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await client.query(statement);
      } catch (error) {
        console.error(`Error in statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
        throw error;
      }
    }
    
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the migration
runMigration();