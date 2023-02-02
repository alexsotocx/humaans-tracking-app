import { Days, PublicHoliday, TimeEntry, TimeOffEntry } from "../types/models";

export const ONE_HOUR_MS = 60 * 60 * 1000;
export type WorkingHoursPerDay = Record<string, number | undefined>;
export type ReadableWorkingTime = { hours: number; minutes: number };
export type CalculatedTimeResponsePerDay = {
  expected: ReadableWorkingTime;
  worked: ReadableWorkingTime;
  missing: null | ReadableWorkingTime;
  extra: null | ReadableWorkingTime;
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

const days = [
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
  return days[dateIndex];
}

// function calculateDifference() {
//   const difference = expectedMsWorkingPerDay - workedTimePerDay[day];
//   if (difference > 0) {
//     workedTimePerDay[day].missing = convertToReadableTime(difference);
//   }
//   if (difference < 0) {
//     const extra = difference * -1;
//     workedTimePerDay[day].extra = convertToReadableTime(extra);
//   }
// }

function findExpectedWorkingTime(params: {
  date: string;
  workingHoursPerDay: WorkingHoursPerDay;
  publicHolidays: PublicHoliday[];
  timeOffEntries: TimeOffEntry[];
}): number {
  // const isPublicHoliday = params.publicHolidays.some(p => p.date === params.date);
  // if (isPublicHoliday) return 0;

  return (
    (params.workingHoursPerDay[mapDateToDay(params.date)] || 0) * ONE_HOUR_MS
  );
}

export function calculateTime(param: {
  publicHolidays: PublicHoliday[];
  holidays: TimeOffEntry[];
  workingHoursPerDay: WorkingHoursPerDay;
  timeEntries: TimeEntry[];
}) {
  const days: Record<string, TimeEntry[]> = {};
  let minimumEntryDate = Number.MAX_SAFE_INTEGER;
  let maximumEntryDate = 0;

  param.timeEntries.forEach((entry) => {
    maximumEntryDate = Math.max(
      maximumEntryDate,
      new Date(entry.date).getTime()
    );
    minimumEntryDate = Math.min(
      minimumEntryDate,
      new Date(entry.date).getTime()
    );
    if (!entry.endTime) {
      return;
    }
    if (!days[entry.date]) days[entry.date] = [];
    days[entry.date].push(entry);
  });

  const workedTimePerDay: Record<
    string,
    {
      expected: number;
      total: number;
    }
  > = {};

  Object.entries(days).forEach(([day, entries]) => {
    const totalWorked = entries.reduce((total, entry) => {
      return total + (entry.endTime!.getTime() - entry.startTime.getTime());
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

  return {
    workedTimePerDay: Object.entries(workedTimePerDay).reduce(
      (res, [day, { expected, total }]) => {
        const difference = expected - total;
        let missing: CalculatedTimeResponsePerDay["missing"] = null;
        let extra: CalculatedTimeResponsePerDay["extra"] = null;
        if (difference > 0) {
          missing = convertToReadableTime(difference);
        } else if (difference < 0) {
          extra = convertToReadableTime(difference * -1);
        }
        res[day] = {
          expected: convertToReadableTime(expected),
          worked: convertToReadableTime(total),
          missing,
          extra,
        };
        return res;
      },
      {} as Record<string, CalculatedTimeResponsePerDay>
    ),
    minimumEntryDate: extractDatePortion(new Date(minimumEntryDate)),
    maximumEntryDate: extractDatePortion(new Date(maximumEntryDate)),
  };
}
