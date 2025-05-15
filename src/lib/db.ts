import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth-schema';

const db = drizzle("postgresql://solid_owner:npg_RhP68esAwWTC@ep-late-king-a2476826-pooler.eu-central-1.aws.neon.tech/solid?sslmode=require", { schema });

export default db;
