import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

export class Station extends Model {}

export interface Station {
  id: string;
  localtimestamp: Date;
  externaltemperature: number;
  internaltemperature: number;
  feelslike: number;
  apparenttemperature: number;
  dewpoint: number;
  externalhumidity: number;
  internalhumidity: number;
  internalpressureabs: number;
  internalpressurerel: number;
  windspeed: number;
  windgust: number;
  winddirection: number;
  solarradiation: number;
  uv: number;
  rain: number;
  eventrain: number;
  dailyrain: number;
  weeklyrain: number;
  monthlyrain: number;
  yearlyrain: number;
  batterystatus: number;
  origem: number;
}

Station.init(
  {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      field: 'ID',
    },
    localtimestamp: {
      type: DataTypes.DATE,
      field: 'LOCALTIMESTAMP',
    },
    externaltemperature: {
      type: DataTypes.FLOAT,
      field: 'EXTERNALTEMPERATURE',
    },
    internaltemperature: {
      type: DataTypes.FLOAT,
      field: 'INTERNALTEMPERATURE',
    },
    feelslike: {
      type: DataTypes.FLOAT,
      field: 'FEELSLIKE',
    },
    apparenttemperature: {
      type: DataTypes.FLOAT,
      field: 'APPARENTTEMPERATURE',
    },
    dewpoint: {
      type: DataTypes.FLOAT,
      field: 'DEWPOINT',
    },
    externalhumidity: {
      type: DataTypes.FLOAT,
      field: 'EXTERNALHUMIDITY',
    },
    internalhumidity: {
      type: DataTypes.FLOAT,
      field: 'INTERNALHUMIDITY',
    },
    internalpressureabs: {
      type: DataTypes.FLOAT,
      field: 'INTERNALPRESSUREABS',
    },
    internalpressurerel: {
      type: DataTypes.FLOAT,
      field: 'INTERNALPRESSUREREL',
    },
    windspeed: {
      type: DataTypes.FLOAT,
      field: 'WINDSPEED',
    },
    windgust: {
      type: DataTypes.FLOAT,
      field: 'WINDGUST',
    },
    winddirection: {
      type: DataTypes.FLOAT,
      field: 'WINDDIRECTION',
    },
    solarradiation: {
      type: DataTypes.FLOAT,
      field: 'SOLARRADIATION',
    },
    uv: {
      type: DataTypes.FLOAT,
      field: 'UV',
    },
    rain: {
      type: DataTypes.FLOAT,
      field: 'RAIN',
    },
    eventrain: {
      type: DataTypes.FLOAT,
      field: 'EVENTRAIN',
    },
    dailyrain: {
      type: DataTypes.FLOAT,
      field: 'DAILYRAIN',
    },
    weeklyrain: {
      type: DataTypes.FLOAT,
      field: 'WEEKLYRAIN',
    },
    monthlyrain: {
      type: DataTypes.FLOAT,
      field: 'MONTHLYRAIN',
    },
    yearlyrain: {
      type: DataTypes.FLOAT,
      field: 'YEARLYRAIN',
    },
    batterystatus: {
      type: DataTypes.FLOAT,
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
