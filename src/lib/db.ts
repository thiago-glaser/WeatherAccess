import { Sequelize } from 'sequelize';

const useCloudDb = process.env.USE_CLOUD_DB === 'true';

const dialectOptions: any = {
  connectString: useCloudDb ? process.env.CLOUD_ORACLE_CONNECTION_STRING : process.env.ORACLE_CONNECTION_STRING,
  autoCommit: true
};

if (useCloudDb && process.env.CLOUD_ORACLE_WALLET_DIR) {
  dialectOptions.walletLocation = process.env.CLOUD_ORACLE_WALLET_DIR;
  dialectOptions.walletPassword = process.env.CLOUD_ORACLE_WALLET_PASSWORD;
  dialectOptions.configDir = process.env.CLOUD_ORACLE_WALLET_DIR;
}

const sequelize = new Sequelize({
  dialect: 'oracle',
  timezone: '+00:00', // Strictly enforce UTC timezone on reading/writing all dates
  username: useCloudDb ? process.env.CLOUD_ORACLE_USER : process.env.ORACLE_USER,
  password: useCloudDb ? process.env.CLOUD_ORACLE_PASSWORD : process.env.ORACLE_PASSWORD,
  dialectOptions: dialectOptions,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 1,
    acquire: 60000,
    idle: 10000
  }
});

export default sequelize;
