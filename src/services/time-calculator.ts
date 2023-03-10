import { Days, PublicHoliday, TimeEntry, TimeOffEntry } from "../types/models";

export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_DAY_MS = ONE_HOUR_MS * 24;

export type WorkingHoursPerDay = Record<string, number | undefined>;
export type ReadableWorkingTime = { hours: number; minutes: number };
export type CalculatedTimeResponse = {
    expected: ReadableWorkingTime;
    totalWorked: ReadableWorkingTime;
    missing: ReadableWorkingTime;
    extra: ReadableWorkingTime;
};

export type CalculatedTime = {
    workedTimePerDay: Record<string, CalculatedTimeResponse>;
    minimumEntryDate: string;
    maximumEntryDate: string;
    total: CalculatedTimeResponse;
};

export function convertToReadableTime(ms: number): ReadableWorkingTime {
    const minutes = Math.floor(ms / (60 * 1000));
    const exactHours = Math.floor(minutes / 60);
    return {
        hours: exactHours,
        minutes: minutes - exactHours * 60,
    };
}

export function extractDatePortion(date: Date): string {
    return date.toISOString().substring(0, 10);
}

export const daysOrder = [
    Days.Sunday,
    Days.Monday,
    Days.Tuesday,
    Days.Wednesday,
    Days.Thursday,
    Days.Friday,
    Days.Saturday,
];

function mapDateToDay(date: string): Days {
    const dateIndex = new Date(date).getDay();
    return daysOrder[dateIndex];
}

function createTotalTime(
    expected: number,
    worked: number
): CalculatedTimeResponse {
    const difference = expected - worked;
    const empty = { hours: 0, minutes: 0 };

    return {
        missing: difference > 0 ? convertToReadableTime(difference) : empty,
        extra: difference < 0 ? convertToReadableTime(difference * -1) : empty,
        expected: convertToReadableTime(expected),
        totalWorked: convertToReadableTime(worked),
    };
}

function findExpectedWorkingTime(params: {
    date: string;
    workingHoursPerDay: WorkingHoursPerDay;
    publicHolidays: PublicHoliday[];
    timeOffEntries: TimeOffEntry[];
}): number {
    const expectedWorkHours =
        (params.workingHoursPerDay[mapDateToDay(params.date)] || 0) *
        ONE_HOUR_MS;
    const isPublicHoliday = params.publicHolidays.some(
        (p) => p.date === params.date
    );
    if (isPublicHoliday) return 0;

    for (const entry of params.timeOffEntries) {
        const holidaysEntries = getListOfDays(entry.startDate, entry.endDate);
        const matchingEntry = holidaysEntries.find(
            (holidayDate) => holidayDate === params.date
        );
        if (matchingEntry) {
            if (
                matchingEntry === entry.startDate &&
                entry.startDatePeriod === "pm"
            ) {
                return expectedWorkHours / 2;
            }

            if (
                matchingEntry === entry.endDate &&
                entry.endDatePeriod === "am"
            ) {
                return expectedWorkHours / 2;
            }

            return 0;
        }
    }

    return expectedWorkHours;
}

export function getListOfDays(startDate: string, endDate: string): string[] {
    let dateIterator = new Date(startDate);
    const dates: string[] = [];
    const endDateObject = new Date(endDate);

    while (dateIterator <= endDateObject) {
        dates.push(extractDatePortion(dateIterator));
        dateIterator = new Date(dateIterator.getTime() + ONE_DAY_MS);
    }

    return dates;
}

function groupTimeEntriesPerDay(
    timeEntries: TimeEntry[]
): Record<string, TimeEntry[]> {
    const timeEntriesPerDay: Record<string, TimeEntry[]> = {};

    timeEntries.forEach((entry) => {
        if (!entry.endTime) {
            return;
        }
        if (!timeEntriesPerDay[entry.date]) timeEntriesPerDay[entry.date] = [];
        timeEntriesPerDay[entry.date].push(entry);
    });

    return timeEntriesPerDay;
}

export function calculateTime(param: {
    startingDate: string;
    endDate: string;
    publicHolidays: PublicHoliday[];
    holidays: TimeOffEntry[];
    workingHoursPerDay: WorkingHoursPerDay;
    timeEntries: TimeEntry[];
}): CalculatedTime {
    const timeEntriesPerDay = groupTimeEntriesPerDay(param.timeEntries);

    const workedTimePerDay: Record<
        string,
        {
            expected: number;
            total: number;
        }
    > = {};

    getListOfDays(param.startingDate, param.endDate).forEach((day) => {
        const entries = timeEntriesPerDay[day] || [];
        const totalWorked = entries.reduce((total, entry) => {
            return (
                total + (entry.endTime!.getTime() - entry.startTime.getTime())
            );
        }, 0);

        workedTimePerDay[day] = {
            expected: findExpectedWorkingTime({
                date: day,
                workingHoursPerDay: param.workingHoursPerDay,
                timeOffEntries: param.holidays,
                publicHolidays: param.publicHolidays,
            }),
            total: totalWorked,
        };
    });

    let totalWorked = 0;
    let totalExpected = 0;
    Object.entries(workedTimePerDay).forEach(([day, { expected, total }]) => {
        totalExpected += expected;
        totalWorked += total;
    });

    return {
        workedTimePerDay: Object.entries(workedTimePerDay).reduce(
            (res, [day, { expected, total }]) => {
                res[day] = createTotalTime(expected, total);
                return res;
            },
            {} as Record<string, CalculatedTimeResponse>
        ),
        minimumEntryDate: param.startingDate,
        maximumEntryDate: param.endDate,
        total: createTotalTime(totalExpected, totalWorked),
    };
}
