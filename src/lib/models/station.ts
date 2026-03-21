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
