const getYesterdayString = (): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDay = formatDateString(yesterday.getDate().toString());
  const yesterdayMonth = formatDateString(
    (yesterday.getMonth() + 1).toString(),
  );
  const yesterdayYear = formatDateString(yesterday.getFullYear().toString());
  return `${yesterdayMonth}/${yesterdayDay}/${yesterdayYear}`;
};
const formatDateString = (date: string) => {
  if (date.length == 1) {
    return '0'.concat(date);
  }
  return date;
};

export const yesterday = getYesterdayString();