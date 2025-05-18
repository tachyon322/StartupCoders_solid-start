import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../auth-schema';

const db = drizzle("postgresql://denis:123123@83.220.169.202:5432/solid_coders", { schema });

export default db;
