import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth-schema';

const db = drizzle(import.meta.env.VITE_DATABASE_URL, { schema });

export default db;
