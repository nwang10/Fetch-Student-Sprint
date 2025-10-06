import { Pool } from 'pg';
import { createClient, RedisClientType } from 'redis';

// PostgreSQL
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'app',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// Redis
export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}) as RedisClientType;

redisClient.on('error', err => console.error('Redis Client Error', err));

export const connectDatabase = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');

    const pgClient = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    pgClient.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
