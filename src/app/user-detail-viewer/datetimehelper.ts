import * as moment from 'moment';
import { Moment } from 'moment';

export const DAY_IN_MILISECOND = 24 * 60 * 60 * 1000;
export const DATE = 'DD/MM/YYYY';
export const TIME = 'h a';
export const DATETIME = 'DD/MM/YYYY, h a';

export const toMinTime = (d: Moment) => d.clone().startOf('day');

export const toMaxTime = (d: Moment) => d.clone().endOf('day');

export const getTimeinMilisecond = (d: Moment) => toMinTime(d).diff(d);

export const convertMiliToString = (time: number) => {
  const days = Math.floor(time / DAY_IN_MILISECOND);
  time = time % DAY_IN_MILISECOND;
  const dt = moment.utc(time);
  if (days === 0 && dt.hour() === 0) {
    return '< 1 hour';
  }

  return `${days} days, ${dt.format('H[ hours]')}`;
};

export const miliToTime = (time: number) => moment.utc(time).format(TIME);

export const timeToDescriptor = (time: number) => {
  const hour = moment.utc(time).hour();
  const timeString = ` (${miliToTime(time)})`;

  if (hour >= 5 && hour < 12) {
    return `Morning` + timeString;
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon' + timeString;
  } else if (hour >= 17 && hour < 21) {
    return 'Evening' + timeString;
  } else {
    return 'Midnight' + timeString;
  }
};
