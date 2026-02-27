import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testando conexão com:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ CONEXÃO COM SUCESSO via pg driver!');
        const res = await client.query('SELECT NOW()');
        console.log('Servidor respondeu:', res.rows[0]);
    } catch (err) {
        console.error('❌ FALHA NA CONEXÃO:', err.message);
    } finally {
        await client.end();
    }
}

test();
