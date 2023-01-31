export enum Days {
  Monday = "monday",
  Tuesday = "tuesday",
  Wednesday = "wednesday",
  Thursday = "thursday",
  Friday = "friday",
  Saturday = "saturday",
  Sunday = "sunday",
}
export type TimeEntry = {
  id: string;
  date: string;
  startTime: Date;
  endTime: Date | null;
  createdAt: Date;
};

export type PublicHoliday = {
  date: string;
  name: string;
};

export type TimeOffEntry = {
  startDate: string;
  endDate: string;
  startDatePeriod: "full" | "pm" | "am";
  endDatePeriod: "full" | "pm" | "am";
};

export type Profile = {
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  workingDays: Days[];
  timeZone: string;
};
