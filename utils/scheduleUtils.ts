export function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function isInSeason(date: Date, start: string, end: string): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const [startMonth, startDay] = start.split('-').map(Number);
    const [endMonth, endDay] = end.split('-').map(Number);
    const dateNum = month * 100 + day;
    return dateNum >= startMonth * 100 + startDay && dateNum <= endMonth * 100 + endDay;
}
