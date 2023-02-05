import { Humaans } from "./types";
import TimeTrackingEntry = Humaans.TimeTrackingEntry;
import {
    Days,
    Profile,
    PublicHoliday,
    TimeEntry,
    TimeOffEntry,
} from "../../types/models";

export function createDateFromDateTimeStrings(
    date: string,
    time: string,
    _timeZone?: string
): Date {
    return new Date(`${date}T${time}.000Z`);
}

export function convertToTimeEntry(entry: TimeTrackingEntry): TimeEntry {
    return {
        date: entry.date,
        endTime: createDateFromDateTimeStrings(entry.date, entry.endTime),
        startTime: createDateFromDateTimeStrings(entry.date, entry.startTime),
        createdAt: new Date(entry.createdAt),
        id: entry.id,
    };
}

export function convertToProfile(jsonProfile: Humaans.Profile): Profile {
    const [, url] = Object.entries(
        jsonProfile.profilePhoto?.variants
    ).reduceRight((biggerEntry, entry) => {
        if (Number(biggerEntry[0]) > Number(entry[0])) return biggerEntry;
        return entry;
    });
    return {
        firstName: jsonProfile.firstName,
        lastName: jsonProfile.lastName,
        profilePhoto: url,
        timeZone: jsonProfile.timezone,
        workingDays: [Days.Thursday],
        id: jsonProfile.id,
        country: jsonProfile.remoteCountryCode,
        region: jsonProfile.remoteRegionCode,
    };
}

export function convertToPublicHoliday(
    jsonPublicHoliday: Humaans.PublicHoliday
): PublicHoliday {
    return {
        date: jsonPublicHoliday.date,
        name: jsonPublicHoliday.name,
        id: jsonPublicHoliday.id,
    };
}

export function convertToTimeOffEntry(
    jsonTimeOff: Humaans.TimeOffEntry
): TimeOffEntry {
    return {
        id: jsonTimeOff.id,
        endDate: jsonTimeOff.endDate,
        startDatePeriod: jsonTimeOff.startPeriod,
        startDate: jsonTimeOff.startDate,
        endDatePeriod: jsonTimeOff.endPeriod,
        publicHolidaysCalendarID: jsonTimeOff.publicHolidayCalendarId,
    };
}
