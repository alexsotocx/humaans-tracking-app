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
    id: string;
};

export type TimeOffEntry = {
    id: string;
    startDate: string;
    endDate: string;
    startDatePeriod: "full" | "pm" | "am";
    endDatePeriod: "full" | "pm" | "am";
    publicHolidaysCalendarID: string;
};

export type Profile = {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
    workingDays: Days[];
    timeZone: string;
    region: string;
    country: string;
};
