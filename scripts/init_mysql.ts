import 'dotenv/config';
import mysql from 'mysql2/promise';

async function initMySQL() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'weather-access';

  console.log(`Connecting to MySQL server at ${host}:${port}...`);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  try {
    console.log(`Creating database \`${database}\` if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);

    console.log(`Switching to database \`${database}\`...`);
    await connection.query(`USE \`${database}\`;`);

    console.log(`Creating table \`STATION\` if it does not exist...`);
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS \`STATION\` (
        \`ID\` VARCHAR(32) NOT NULL PRIMARY KEY,
        \`LOCALTIMESTAMP\` DATETIME(3) NULL,
        \`EXTERNALTEMPERATURE\` FLOAT NULL,
        \`INTERNALTEMPERATURE\` FLOAT NULL,
        \`FEELSLIKE\` FLOAT NULL,
        \`APPARENTTEMPERATURE\` FLOAT NULL,
        \`DEWPOINT\` FLOAT NULL,
        \`EXTERNALHUMIDITY\` FLOAT NULL,
        \`INTERNALHUMIDITY\` FLOAT NULL,
        \`INTERNALPRESSUREABS\` FLOAT NULL,
        \`INTERNALPRESSUREREL\` FLOAT NULL,
        \`WINDSPEED\` FLOAT NULL,
        \`WINDGUST\` FLOAT NULL,
        \`WINDDIRECTION\` FLOAT NULL,
        \`SOLARRADIATION\` FLOAT NULL,
        \`UV\` FLOAT NULL,
        \`RAIN\` FLOAT NULL,
        \`EVENTRAIN\` FLOAT NULL,
        \`DAILYRAIN\` FLOAT NULL,
        \`WEEKLYRAIN\` FLOAT NULL,
        \`MONTHLYRAIN\` FLOAT NULL,
        \`YEARLYRAIN\` FLOAT NULL,
        \`BATTERYSTATUS\` FLOAT NULL,
        \`ORIGEM\` INT NULL,
        INDEX idx_localtimestamp (\`LOCALTIMESTAMP\` DESC),
        INDEX idx_origem_timestamp (\`ORIGEM\`, \`LOCALTIMESTAMP\` DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(createTableSql);
    console.log(`Table \`STATION\` created or verified successfully.`);
  } catch (error) {
    console.error('Error initializing MySQL schema:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initMySQL();
