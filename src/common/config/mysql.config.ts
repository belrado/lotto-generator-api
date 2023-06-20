import { registerAs } from '@nestjs/config';

export default registerAs('mysql', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 3370,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
}));
