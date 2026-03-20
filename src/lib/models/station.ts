import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export class Station extends Model {
  public id!: string;
  public localtimestamp!: Date;
  public externaltemperature!: number;
  public internaltemperature!: number;
  public feelslike!: number;
  public apparenttemperature!: number;
  public dewpoint!: number;
  public externalhumidity!: number;
  public internalhumidity!: number;
  public internalpressureabs!: number;
  public internalpressurerel!: number;
  public windspeed!: number;
  public windgust!: number;
  public winddirection!: number;
  public solarradiation!: number;
  public uv!: number;
  public rain!: number;
  public eventrain!: number;
  public dailyrain!: number;
  public weeklyrain!: number;
  public monthlyrain!: number;
  public yearlyrain!: number;
  public batterystatus!: number;
  public origem!: number;
}

Station.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      field: 'ID',
    },
    localtimestamp: {
      type: DataTypes.DATE,
      field: 'LOCALTIMESTAMP',
    },
    externaltemperature: {
      type: DataTypes.DECIMAL,
      field: 'EXTERNALTEMPERATURE',
    },
    internaltemperature: {
      type: DataTypes.DECIMAL,
      field: 'INTERNALTEMPERATURE',
    },
    feelslike: {
      type: DataTypes.DECIMAL,
      field: 'FEELSLIKE',
    },
    apparenttemperature: {
      type: DataTypes.DECIMAL,
      field: 'APPARENTTEMPERATURE',
    },
    dewpoint: {
      type: DataTypes.DECIMAL,
      field: 'DEWPOINT',
    },
    externalhumidity: {
      type: DataTypes.DECIMAL,
      field: 'EXTERNALHUMIDITY',
    },
    internalhumidity: {
      type: DataTypes.DECIMAL,
      field: 'INTERNALHUMIDITY',
    },
    internalpressureabs: {
      type: DataTypes.DECIMAL,
      field: 'INTERNALPRESSUREABS',
    },
    internalpressurerel: {
      type: DataTypes.DECIMAL,
      field: 'INTERNALPRESSUREREL',
    },
    windspeed: {
      type: DataTypes.DECIMAL,
      field: 'WINDSPEED',
    },
    windgust: {
      type: DataTypes.DECIMAL,
      field: 'WINDGUST',
    },
    winddirection: {
      type: DataTypes.DECIMAL,
      field: 'WINDDIRECTION',
    },
    solarradiation: {
      type: DataTypes.DECIMAL,
      field: 'SOLARRADIATION',
    },
    uv: {
      type: DataTypes.DECIMAL,
      field: 'UV',
    },
    rain: {
      type: DataTypes.DECIMAL,
      field: 'RAIN',
    },
    eventrain: {
      type: DataTypes.DECIMAL,
      field: 'EVENTRAIN',
    },
    dailyrain: {
      type: DataTypes.DECIMAL,
      field: 'DAILYRAIN',
    },
    weeklyrain: {
      type: DataTypes.DECIMAL,
      field: 'WEEKLYRAIN',
    },
    monthlyrain: {
      type: DataTypes.DECIMAL,
      field: 'MONTHLYRAIN',
    },
    yearlyrain: {
      type: DataTypes.DECIMAL,
      field: 'YEARLYRAIN',
    },
    batterystatus: {
      type: DataTypes.DECIMAL,
      field: 'BATTERYSTATUS',
    },
    origem: {
      type: DataTypes.INTEGER,
      field: 'ORIGEM',
    },
  },
  {
    sequelize,
    tableName: 'STATION',
    timestamps: false,
  }
);
