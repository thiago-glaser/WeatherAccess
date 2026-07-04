import 'dotenv/config';
import path from 'path';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import mysql from 'mysql2/promise';

async function migrate() {
  console.log('--- Starting Oracle to MySQL Migration ---');

  // 1. Connect to Oracle using Sequelize
  const useCloudDb = process.env.USE_CLOUD_DB === 'true';
  const dialectOptions: any = {
    connectString: useCloudDb ? process.env.CLOUD_ORACLE_CONNECTION_STRING : process.env.ORACLE_CONNECTION_STRING,
    autoCommit: true
  };

  if (useCloudDb && process.env.CLOUD_ORACLE_WALLET_DIR) {
    dialectOptions.walletLocation = path.resolve(process.env.CLOUD_ORACLE_WALLET_DIR);
    dialectOptions.walletPassword = process.env.CLOUD_ORACLE_WALLET_PASSWORD;
  }

  const oracleSequelize = new Sequelize({
    dialect: 'oracle',
    timezone: '+00:00',
    username: useCloudDb ? process.env.CLOUD_ORACLE_USER : process.env.ORACLE_USER,
    password: useCloudDb ? process.env.CLOUD_ORACLE_PASSWORD : process.env.ORACLE_PASSWORD,
    dialectOptions: dialectOptions,
    logging: false,
  });

  class OracleStation extends Model {}
  OracleStation.init(
    {
      id: { type: DataTypes.STRING(32), primaryKey: true, field: 'ID' },
      localtimestamp: { type: DataTypes.DATE, field: 'LOCALTIMESTAMP' },
      externaltemperature: { type: DataTypes.FLOAT, field: 'EXTERNALTEMPERATURE' },
      internaltemperature: { type: DataTypes.FLOAT, field: 'INTERNALTEMPERATURE' },
      feelslike: { type: DataTypes.FLOAT, field: 'FEELSLIKE' },
      apparenttemperature: { type: DataTypes.FLOAT, field: 'APPARENTTEMPERATURE' },
      dewpoint: { type: DataTypes.FLOAT, field: 'DEWPOINT' },
      externalhumidity: { type: DataTypes.FLOAT, field: 'EXTERNALHUMIDITY' },
      internalhumidity: { type: DataTypes.FLOAT, field: 'INTERNALHUMIDITY' },
      internalpressureabs: { type: DataTypes.FLOAT, field: 'INTERNALPRESSUREABS' },
      internalpressurerel: { type: DataTypes.FLOAT, field: 'INTERNALPRESSUREREL' },
      windspeed: { type: DataTypes.FLOAT, field: 'WINDSPEED' },
      windgust: { type: DataTypes.FLOAT, field: 'WINDGUST' },
      winddirection: { type: DataTypes.FLOAT, field: 'WINDDIRECTION' },
      solarradiation: { type: DataTypes.FLOAT, field: 'SOLARRADIATION' },
      uv: { type: DataTypes.FLOAT, field: 'UV' },
      rain: { type: DataTypes.FLOAT, field: 'RAIN' },
      eventrain: { type: DataTypes.FLOAT, field: 'EVENTRAIN' },
      dailyrain: { type: DataTypes.FLOAT, field: 'DAILYRAIN' },
      weeklyrain: { type: DataTypes.FLOAT, field: 'WEEKLYRAIN' },
      monthlyrain: { type: DataTypes.FLOAT, field: 'MONTHLYRAIN' },
      yearlyrain: { type: DataTypes.FLOAT, field: 'YEARLYRAIN' },
      batterystatus: { type: DataTypes.FLOAT, field: 'BATTERYSTATUS' },
      origem: { type: DataTypes.INTEGER, field: 'ORIGEM' },
    },
    {
      sequelize: oracleSequelize,
      tableName: 'STATION',
      timestamps: false,
    }
  );

  try {
    console.log('Authenticating with Oracle Database...');
    await oracleSequelize.authenticate();
    console.log('Oracle Database connected successfully.');
  } catch (error) {
    console.error('Failed to connect to Oracle Database:', error);
    process.exit(1);
  }

  // 2. Connect to MySQL
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'weather-access';

  console.log(`Connecting to MySQL database \`${database}\` at ${host}:${port}...`);
  const mysqlPool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    timezone: '+00:00',
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const totalCount = await OracleStation.count();
    console.log(`Total records in Oracle \`STATION\` table: ${totalCount}`);

    if (totalCount === 0) {
      console.log('No records to migrate. Exiting.');
      process.exit(0);
    }

    const batchSize = 2000;
    
    // Check max ID in MySQL to resume where we left off
    const [maxRes]: any = await mysqlPool.query('SELECT MAX(ID) as maxId, COUNT(*) as cnt FROM STATION');
    let lastId: string | null = maxRes[0]?.maxId || null;
    let totalMigrated: number = maxRes[0]?.cnt || 0;

    console.log(`Resuming migration after ID: ${lastId || 'START'} (already in MySQL: ${totalMigrated})`);

    const formatTs = (val: any) => {
      if (!val) return null;
      if (val instanceof Date) {
        return val.toISOString().slice(0, 23).replace('T', ' ');
      }
      if (typeof val === 'string') {
        return val.slice(0, 23).replace('T', ' ');
      }
      return val;
    };

    while (true) {
      const whereClause: any = lastId ? { id: { [Op.gt]: lastId } } : {};
      console.log(`Fetching next batch (up to ${batchSize}) from Oracle after ID: ${lastId || 'START'}...`);
      
      const rows = await OracleStation.findAll({
        where: whereClause,
        limit: batchSize,
        order: [['id', 'ASC']],
        raw: true,
      });

      if (rows.length === 0) break;

      const values = rows.map((r: any) => [
        r.id,
        formatTs(r.localtimestamp),
        r.externaltemperature ?? null,
        r.internaltemperature ?? null,
        r.feelslike ?? null,
        r.apparenttemperature ?? null,
        r.dewpoint ?? null,
        r.externalhumidity ?? null,
        r.internalhumidity ?? null,
        r.internalpressureabs ?? null,
        r.internalpressurerel ?? null,
        r.windspeed ?? null,
        r.windgust ?? null,
        r.winddirection ?? null,
        r.solarradiation ?? null,
        r.uv ?? null,
        r.rain ?? null,
        r.eventrain ?? null,
        r.dailyrain ?? null,
        r.weeklyrain ?? null,
        r.monthlyrain ?? null,
        r.yearlyrain ?? null,
        r.batterystatus ?? null,
        r.origem ?? null,
      ]);

      const insertSql = `
        INSERT INTO \`STATION\` (
          \`ID\`, \`LOCALTIMESTAMP\`, \`EXTERNALTEMPERATURE\`, \`INTERNALTEMPERATURE\`,
          \`FEELSLIKE\`, \`APPARENTTEMPERATURE\`, \`DEWPOINT\`, \`EXTERNALHUMIDITY\`,
          \`INTERNALHUMIDITY\`, \`INTERNALPRESSUREABS\`, \`INTERNALPRESSUREREL\`,
          \`WINDSPEED\`, \`WINDGUST\`, \`WINDDIRECTION\`, \`SOLARRADIATION\`, \`UV\`,
          \`RAIN\`, \`EVENTRAIN\`, \`DAILYRAIN\`, \`WEEKLYRAIN\`, \`MONTHLYRAIN\`, \`YEARLYRAIN\`,
          \`BATTERYSTATUS\`, \`ORIGEM\`
        ) VALUES ?
        ON DUPLICATE KEY UPDATE
          \`LOCALTIMESTAMP\`=VALUES(\`LOCALTIMESTAMP\`),
          \`EXTERNALTEMPERATURE\`=VALUES(\`EXTERNALTEMPERATURE\`),
          \`INTERNALTEMPERATURE\`=VALUES(\`INTERNALTEMPERATURE\`),
          \`FEELSLIKE\`=VALUES(\`FEELSLIKE\`),
          \`APPARENTTEMPERATURE\`=VALUES(\`APPARENTTEMPERATURE\`),
          \`DEWPOINT\`=VALUES(\`DEWPOINT\`),
          \`EXTERNALHUMIDITY\`=VALUES(\`EXTERNALHUMIDITY\`),
          \`INTERNALHUMIDITY\`=VALUES(\`INTERNALHUMIDITY\`),
          \`INTERNALPRESSUREABS\`=VALUES(\`INTERNALPRESSUREABS\`),
          \`INTERNALPRESSUREREL\`=VALUES(\`INTERNALPRESSUREREL\`),
          \`WINDSPEED\`=VALUES(\`WINDSPEED\`),
          \`WINDGUST\`=VALUES(\`WINDGUST\`),
          \`WINDDIRECTION\`=VALUES(\`WINDDIRECTION\`),
          \`SOLARRADIATION\`=VALUES(\`SOLARRADIATION\`),
          \`UV\`=VALUES(\`UV\`),
          \`RAIN\`=VALUES(\`RAIN\`),
          \`EVENTRAIN\`=VALUES(\`EVENTRAIN\`),
          \`DAILYRAIN\`=VALUES(\`DAILYRAIN\`),
          \`WEEKLYRAIN\`=VALUES(\`WEEKLYRAIN\`),
          \`MONTHLYRAIN\`=VALUES(\`MONTHLYRAIN\`),
          \`YEARLYRAIN\`=VALUES(\`YEARLYRAIN\`),
          \`BATTERYSTATUS\`=VALUES(\`BATTERYSTATUS\`),
          \`ORIGEM\`=VALUES(\`ORIGEM\`)
      `;

      await mysqlPool.query(insertSql, [values]);
      totalMigrated += rows.length;
      console.log(`Migrated ${totalMigrated}/${totalCount} records.`);

      lastId = rows[rows.length - 1].id;
    }

    console.log('--- Migration Completed Successfully ---');
    console.log(`Total records migrated: ${totalMigrated}`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await oracleSequelize.close();
    await mysqlPool.end();
  }
}

migrate();
