import * as moment from 'moment';
import { Moment } from 'moment';

export const DAY_IN_MILISECOND = 24 * 60 * 60 * 1000;
export const DATE = 'DD/MM/YYYY';
export const TIME = 'h:mm:ss a';
export const DATETIME = 'DD/MM/YYYY h:mm:ss a';

export const toMinTime = (d: Moment) => d.clone().startOf('day');

export const toMaxTime = (d: Moment) => d.clone().endOf('day');

export const getTimeinMilisecond = (d: Moment) => toMinTime(d).diff(d);

export const convertMiliToString = (time: number) => {
  const days = Math.floor(time / DAY_IN_MILISECOND);
  time = time % DAY_IN_MILISECOND;
  const dt = moment.utc(time);
  return `${days} days, ${dt.format('H[ hours, ]m[ minutes]')}`;
};

export const miliToTime = (time: number) => moment.utc(time).format(TIME);
