import { FixedPriceBid } from '../models/fixedPriceBids';
import { Position } from '../models/positions';
import { formatMoney } from './money';

export const getPricePerSquareFoot = (price: number, sqft: number): string => {
  return formatMoney(price / sqft);
};

export const getRextimateChange = (
  listPrice: number,
  rextimate: number,
): string => {
  return formatMoney(rextimate - listPrice);
};
const daysBetween = (date1: Date, date2: Date): number => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  // Discard the time and time-zone information.
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

export const getDaysOnRexchange = (dateCreated: any): number => {
  const dateListed = new Date(dateCreated?.toDate());
  const today = new Date();
  return daysBetween(dateListed, today);
};

const isWithin2000 = (difference: number): boolean => {
  return Boolean(Math.abs(difference) <= 2000);
};
const isPositiveEquity = (difference: number, type: 0 | 1): boolean => {
  return Boolean(
    (difference > 0 && type == 0) || (difference < 0 && type == 1),
  );
};

export const getEquityForOnePosition = (
  position: Position,
  rextimateOrSalePrice: number,
  numJustRight: number,
  isSold = false,
) => {
  let amount = 0;
  const positionRextimate = position.rextimate;
  const difference = rextimateOrSalePrice - positionRextimate;
  const type = position.type;
  if (type == 2 && !isSold) {
    if (isWithin2000(difference)) {
      amount += 400 * (101 - numJustRight);
    }
  }

  if (type != 2) {
    if (isPositiveEquity(difference, type)) {
      amount += Math.abs(difference);
    } else {
      amount -= Math.abs(difference);
    }
  }
  return amount;
};
export const getPositionEquity = (
  positions: Position[] = [],
  rextimateOrSalePrice: number = 0,
  numJustRight: number = 0,
  isSold = false,
): number => {
  let equity: number = 0;
  if (positions.length) {
    for (const position of positions) {
      const amount = getEquityForOnePosition(
        position,
        rextimateOrSalePrice,
        numJustRight,
        isSold,
      );
      equity += amount;
    }
  }

  return equity;
};

export const getFixedPriceBidEquity = (
  fixedPriceBid: FixedPriceBid | null,
  rextimateOrSalePrice: number,
  numJustRight: number,
): number => {
  let equity = 0;
  if (!fixedPriceBid) return equity;
  const difference = rextimateOrSalePrice - fixedPriceBid.amount;
  const absValOfDifference = Math.abs(difference);
  if (absValOfDifference <= 2000) {
    equity += 1000 * (101 - numJustRight);
  }
  return equity;
};

export const getDateFromTimestamp = (timestamp: any): string => {
  const date = new Date(timestamp?.toDate());

  return date.toLocaleDateString();
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const isSinceMidnight = (position: Position): boolean => {
  const midnight = new Date(new Date().setHours(0, 0, 0, 0));
  const date = new Date((position.dateCreated as any).toDate());
  return isSameDay(date, midnight);
};
