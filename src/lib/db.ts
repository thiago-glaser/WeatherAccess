import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { Sequelize } from 'sequelize';

const useCloudDb = process.env.USE_CLOUD_DB === 'true';

const dialectOptions: any = {
  connectString: useCloudDb ? process.env.CLOUD_ORACLE_CONNECTION_STRING : process.env.ORACLE_CONNECTION_STRING,
  autoCommit: true
};

if (useCloudDb && process.env.CLOUD_ORACLE_WALLET_DIR) {
  dialectOptions.walletLocation = path.resolve(process.env.CLOUD_ORACLE_WALLET_DIR);
  dialectOptions.walletPassword = process.env.CLOUD_ORACLE_WALLET_PASSWORD;
}

const sequelize = new Sequelize({
  dialect: 'oracle',
  timezone: '+00:00', // Keep internal Sequelize operations to UTC offset and handle shifts in conversions
  username: useCloudDb ? process.env.CLOUD_ORACLE_USER : process.env.ORACLE_USER,
  password: useCloudDb ? process.env.CLOUD_ORACLE_PASSWORD : process.env.ORACLE_PASSWORD,
  dialectOptions: dialectOptions,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 1,
    acquire: 15000, // fail fast if a connection can't be obtained (was 60s — too slow to diagnose lock issues)
    idle: 10000
  }
});

export default sequelize;
