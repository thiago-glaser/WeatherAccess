import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  timezone: '+00:00', // Keep internal Sequelize operations to UTC offset and handle shifts in conversions
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'weather-access',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 1,
    acquire: 15000, // fail fast if a connection can't be obtained
    idle: 10000
  }
});

export default sequelize;
