import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config();

export default defineConfig({
    earlyAccess: true,
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),
    seed: 'npx tsx prisma/seed.ts',
});
